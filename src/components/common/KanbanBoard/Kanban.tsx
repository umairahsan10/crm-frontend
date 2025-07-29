import React, { useState, useRef, useCallback, useMemo } from 'react';
import './Kanban.css';

// Types
export interface KanbanCard {
  id: string;
  title: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional custom properties
}

export interface KanbanColumn {
  id: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  maxCards?: number;
  allowAdd?: boolean;
  allowDrop?: boolean;
  [key: string]: any; // Allow additional custom properties
}

export interface KanbanBoard {
  id: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  columnOrder: string[];
}

// Size variants
export type KanbanSize = 'sm' | 'md' | 'lg';

// Theme variants
export type KanbanTheme = 'default' | 'minimal' | 'dark';

// Drag and drop types
export interface DragItem {
  type: 'card';
  cardId: string;
  sourceColumnId: string;
  sourceIndex: number;
}

export interface DropResult {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  sourceIndex: number;
  targetIndex: number;
}

// Props interface
export interface KanbanProps {
  // Core props
  board: KanbanBoard;
  
  // Display props
  size?: KanbanSize;
  theme?: KanbanTheme;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Functionality props
  draggable?: boolean;
  allowAddCards?: boolean;
  allowDeleteCards?: boolean;
  allowEditCards?: boolean;
  allowMoveColumns?: boolean;
  allowDeleteColumns?: boolean;
  
  // Customization props
  className?: string;
  style?: React.CSSProperties;
  columnClassName?: string;
  cardClassName?: string;
  
  // Custom render props
  renderCard?: (card: KanbanCard, props: {
    isDragging: boolean;
    isDragOver: boolean;
  }) => React.ReactNode;
  renderCardHeader?: (card: KanbanCard) => React.ReactNode;
  renderCardContent?: (card: KanbanCard) => React.ReactNode;
  renderCardFooter?: (card: KanbanCard) => React.ReactNode;
  renderColumnHeader?: (column: KanbanColumn, cardCount: number) => React.ReactNode;
  renderAddCard?: (columnId: string) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  
  // Event handlers
  onCardAdd?: (columnId: string, card: Omit<KanbanCard, 'id'>) => void;
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  onCardDelete?: (cardId: string, columnId: string) => void;
  onCardMove?: (result: DropResult) => void;
  onColumnAdd?: (column: Omit<KanbanColumn, 'id'>) => void;
  onColumnUpdate?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnReorder?: (columnOrder: string[]) => void;
  onBoardUpdate?: (board: KanbanBoard) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Custom props
  [key: string]: any;
}

const Kanban: React.FC<KanbanProps> = ({
  board,
  size = 'md',
  theme = 'default',
  loading = false,
  emptyMessage = 'No cards found',
  emptyIcon = '📋',
  draggable = true,
  allowAddCards = true,
  allowDeleteCards = true,
  allowEditCards = true,
  allowMoveColumns = false,
  allowDeleteColumns = false,
  className = '',
  style = {},
  columnClassName = '',
  cardClassName = '',
  renderCard,
  renderCardHeader,
  renderCardContent,
  renderCardFooter,
  renderColumnHeader,
  renderAddCard,
  renderEmpty,
  renderLoading,
  onCardAdd,
  onCardUpdate,
  onCardDelete,
  onCardMove,
  onColumnAdd,
  onColumnUpdate,
  onColumnDelete,
  onColumnReorder,
  onBoardUpdate,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) => {
  // State management
  const [draggedCard, setDraggedCard] = useState<DragItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  
  // Refs
  const boardRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  
  // Memoized values
  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, KanbanCard[]> = {};
    board.columns.forEach(column => {
      grouped[column.id] = [];
    });
    
    board.cards.forEach(card => {
      // Find which column this card belongs to
      for (const column of board.columns) {
        if (card.columnId === column.id) {
          grouped[column.id].push(card);
          break;
        }
      }
    });
    
    return grouped;
  }, [board.cards, board.columns]);
  
  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, card: KanbanCard, columnId: string, index: number) => {
    if (!draggable) return;
    
    setDraggedCard({
      type: 'card',
      cardId: card.id,
      sourceColumnId: columnId,
      sourceIndex: index
    });
    
    // Set drag image
    if (dragPreviewRef.current) {
      e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
  }, [draggable]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, columnId: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedCard && draggedCard.sourceColumnId !== columnId) {
      setDragOverColumn(columnId);
      setDragOverIndex(index);
    }
  }, [draggedCard]);
  
  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: string, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedCard || !onCardMove) return;
    
    const result: DropResult = {
      cardId: draggedCard.cardId,
      sourceColumnId: draggedCard.sourceColumnId,
      targetColumnId,
      sourceIndex: draggedCard.sourceIndex,
      targetIndex
    };
    
    onCardMove(result);
    handleDragEnd();
  }, [draggedCard, onCardMove, handleDragEnd]);
  
  // Card handlers
  const handleCardAdd = useCallback((columnId: string) => {
    if (!allowAddCards || !onCardAdd) return;
    
    const newCard: Omit<KanbanCard, 'id'> = {
      title: 'New Card',
      content: '',
      columnId
    };
    
    onCardAdd(columnId, newCard);
  }, [allowAddCards, onCardAdd]);
  
  const handleCardDelete = useCallback((cardId: string, columnId: string) => {
    if (!allowDeleteCards || !onCardDelete) return;
    onCardDelete(cardId, columnId);
  }, [allowDeleteCards, onCardDelete]);
  

  
  // Column handlers
  const handleColumnDelete = useCallback((columnId: string) => {
    if (!allowDeleteColumns || !onColumnDelete) return;
    onColumnDelete(columnId);
  }, [allowDeleteColumns, onColumnDelete]);
  
  // Render functions
  const renderDefaultCard = useCallback((card: KanbanCard, isDragging: boolean, isDragOver: boolean) => (
    <div
      key={card.id}
      className={`kanban__card ${cardClassName} ${isDragging ? 'kanban__card--dragging' : ''} ${isDragOver ? 'kanban__card--drag-over' : ''}`}
      draggable={draggable}
      onDragStart={(e) => handleDragStart(e, card, card.columnId || '', 0)}
      onDragEnd={handleDragEnd}
      tabIndex={0}
    >
      <div className="kanban__card-header">
        <h3 className="kanban__card-title">
          {renderCardHeader ? renderCardHeader(card) : card.title}
        </h3>
        <div className="kanban__card-actions">

          {allowDeleteCards && (
            <button
              type="button"
              className="kanban__card-action"
              onClick={() => handleCardDelete(card.id, card.columnId || '')}
              aria-label="Delete card"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {card.content && (
        <div className="kanban__card-content">
          {renderCardContent ? renderCardContent(card) : card.content}
        </div>
      )}
      
      {(card.priority || card.assignee || card.dueDate) && (
        <div className="kanban__card-footer">
          <div className="kanban__card-meta">
            {card.priority && (
              <span className={`kanban__card-priority kanban__card-priority--${card.priority}`}>
                {card.priority}
              </span>
            )}
            {card.assignee && <span>👤 {card.assignee}</span>}
            {card.dueDate && <span>📅 {new Date(card.dueDate).toLocaleDateString()}</span>}
          </div>
          {renderCardFooter && renderCardFooter(card)}
        </div>
      )}
    </div>
  ), [
    cardClassName,
    draggable,
    allowDeleteCards,
    handleDragStart,
    handleDragEnd,
    handleCardDelete,
    renderCardHeader,
    renderCardContent,
    renderCardFooter
  ]);
  
  const renderDefaultColumnHeader = useCallback((column: KanbanColumn, cardCount: number) => (
    <div className="kanban__column-header">
      <h2 className="kanban__column-title">
        {column.icon && <span>{column.icon}</span>}
        {column.title}
        <span className="kanban__column-count">{cardCount}</span>
      </h2>
      <div className="kanban__column-actions">
        {allowDeleteColumns && (
          <button
            type="button"
            className="kanban__column-action"
            onClick={() => handleColumnDelete(column.id)}
            aria-label={`Delete column ${column.title}`}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  ), [allowDeleteColumns, handleColumnDelete]);
  
  const renderDefaultAddCard = useCallback((columnId: string) => (
    <button
      type="button"
      className="kanban__add-card"
      onClick={() => handleCardAdd(columnId)}
      aria-label={`Add card to column`}
    >
      <span className="kanban__add-card-icon">+</span>
      Add Card
    </button>
  ), [handleCardAdd]);
  
  const renderDefaultEmpty = useCallback(() => (
    <div className="kanban__empty">
      <div className="kanban__empty-icon">{emptyIcon}</div>
      <h3 className="kanban__empty-title">No Cards</h3>
      <p className="kanban__empty-message">{emptyMessage}</p>
    </div>
  ), [emptyIcon, emptyMessage]);
  
  const renderDefaultLoading = useCallback(() => (
    <div className="kanban__loading">
      <div className="kanban__loading-spinner"></div>
      Loading...
    </div>
  ), []);
  
  // Build CSS classes
  const cssClasses = [
    'kanban',
    `kanban--${size}`,
    `kanban--${theme}`,
    className
  ].filter(Boolean).join(' ');
  
  // Don't render if loading
  if (loading) {
    return (
      <div className={cssClasses} style={style} {...restProps}>
        {renderLoading ? renderLoading() : renderDefaultLoading()}
      </div>
    );
  }
  
  // Don't render if no columns
  if (!board.columns.length) {
    return (
      <div className={cssClasses} style={style} {...restProps}>
        {renderEmpty ? renderEmpty() : renderDefaultEmpty()}
      </div>
    );
  }
  
  return (
    <div
      ref={boardRef}
      className={cssClasses}
      style={style}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role="region"
      {...restProps}
    >
      {board.columnOrder.map((columnId) => {
        const column = board.columns.find(col => col.id === columnId);
        if (!column) return null;
        
        const cards = cardsByColumn[column.id] || [];
        const isDragOver = dragOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className={`kanban__column ${columnClassName}`}
            onDragOver={(e) => handleDragOver(e, column.id, cards.length)}
            onDrop={(e) => handleDrop(e, column.id, cards.length)}
          >
            {renderColumnHeader ? 
              renderColumnHeader(column, cards.length) : 
              renderDefaultColumnHeader(column, cards.length)
            }
            
            <div className={`kanban__cards ${cards.length === 0 ? 'kanban__cards--empty' : ''}`}>
              {cards.length === 0 ? (
                <div className="kanban__cards--empty">
                  No cards in this column
                </div>
              ) : (
                cards.map((card, index) => {
                  const isDragging = draggedCard?.cardId === card.id;
                  const isDragOver = dragOverColumn === column.id && dragOverIndex === index;
                  
                  return renderCard ? 
                    renderCard(card, { isDragging, isDragOver }) :
                    renderDefaultCard(card, isDragging, isDragOver);
                })
              )}
              
              {isDragOver && (
                <div className="kanban__drop-indicator kanban__drop-indicator--active" />
              )}
            </div>
            
            {allowAddCards && column.allowAdd !== false && (
              renderAddCard ? 
                renderAddCard(column.id) : 
                renderDefaultAddCard(column.id)
            )}
          </div>
        );
      })}
      
      {/* Drag preview */}
      <div
        ref={dragPreviewRef}
        style={{
          position: 'absolute',
          top: '-1000px',
          left: '-1000px',
          pointerEvents: 'none',
          opacity: 0
        }}
      >
        {draggedCard && (
          <div className="kanban__card kanban__card--dragging">
            {board.cards.find(card => card.id === draggedCard.cardId)?.title || 'Card'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban; 