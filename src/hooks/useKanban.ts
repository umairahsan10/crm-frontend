import { useState, useCallback, useMemo } from 'react';
import type { KanbanBoard, KanbanCard, KanbanColumn, DropResult } from '../components/previous_components/ui/Kanban';

export interface UseKanbanOptions {
  initialBoard?: KanbanBoard;
  autoSave?: boolean;
  onBoardChange?: (board: KanbanBoard) => void;
}

export interface UseKanbanReturn {
  board: KanbanBoard;
  cardsByColumn: Record<string, KanbanCard[]>;
  
  // Card operations
  addCard: (columnId: string, card: Omit<KanbanCard, 'id'>) => string;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (result: DropResult) => void;
  getCard: (cardId: string) => KanbanCard | undefined;
  
  // Column operations
  addColumn: (column: Omit<KanbanColumn, 'id'>) => string;
  updateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (columnOrder: string[]) => void;
  getColumn: (columnId: string) => KanbanColumn | undefined;
  
  // Board operations
  updateBoard: (updates: Partial<KanbanBoard>) => void;
  resetBoard: (newBoard: KanbanBoard) => void;
  
  // Utility functions
  getColumnCardCount: (columnId: string) => number;
  getCardsByPriority: (priority: KanbanCard['priority']) => KanbanCard[];
  getCardsByAssignee: (assignee: string) => KanbanCard[];
  searchCards: (query: string) => KanbanCard[];
}

export const useKanban = (options: UseKanbanOptions = {}): UseKanbanReturn => {
  const { initialBoard, autoSave = false, onBoardChange } = options;
  
  const [board, setBoard] = useState<KanbanBoard>(initialBoard || {
    id: 'default',
    columns: [],
    cards: [],
    columnOrder: []
  });

  // Memoized cards by column
  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, KanbanCard[]> = {};
    board.columns.forEach((column: KanbanColumn) => {
      grouped[column.id] = [];
    });
    
    board.cards.forEach((card: KanbanCard) => {
      if (card.columnId && grouped[card.columnId]) {
        grouped[card.columnId].push(card);
      }
    });
    
    return grouped;
  }, [board.cards, board.columns]);

  // Helper function to update board and trigger callbacks
  const updateBoardState = useCallback((updater: (prev: KanbanBoard) => KanbanBoard) => {
    setBoard((prev: KanbanBoard) => {
      const newBoard = updater(prev);
      if (autoSave) {
        // Save to localStorage
        localStorage.setItem(`kanban-board-${newBoard.id}`, JSON.stringify(newBoard));
      }
      if (onBoardChange) {
        onBoardChange(newBoard);
      }
      return newBoard;
    });
  }, [autoSave, onBoardChange]);

  // Card operations
  const addCard = useCallback((columnId: string, card: Omit<KanbanCard, 'id'>): string => {
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCard: KanbanCard = {
      title: card.title || 'New Card',
      ...card,
      id: cardId,
      columnId
    };

    updateBoardState(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));

    return cardId;
  }, [updateBoardState]);

  const updateCard = useCallback((cardId: string, updates: Partial<KanbanCard>) => {
    updateBoardState(prev => ({
      ...prev,
      cards: prev.cards.map((card: KanbanCard) =>
        card.id === cardId ? { ...card, ...updates } : card
      )
    }));
  }, [updateBoardState]);

  const deleteCard = useCallback((cardId: string) => {
    updateBoardState(prev => ({
      ...prev,
      cards: prev.cards.filter((card: KanbanCard) => card.id !== cardId)
    }));
  }, [updateBoardState]);

  const moveCard = useCallback((result: DropResult) => {
    updateBoardState(prev => ({
      ...prev,
      cards: prev.cards.map((card: KanbanCard) =>
        card.id === result.cardId
          ? { ...card, columnId: result.targetColumnId }
          : card
      )
    }));
  }, [updateBoardState]);

  const getCard = useCallback((cardId: string): KanbanCard | undefined => {
    return board.cards.find((card: KanbanCard) => card.id === cardId);
  }, [board.cards]);

  // Column operations
  const addColumn = useCallback((column: Omit<KanbanColumn, 'id'>): string => {
    const columnId = `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newColumn: KanbanColumn = {
      title: column.title || 'New Column',
      ...column,
      id: columnId
    };

    updateBoardState(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      columnOrder: [...prev.columnOrder, columnId]
    }));

    return columnId;
  }, [updateBoardState]);

  const updateColumn = useCallback((columnId: string, updates: Partial<KanbanColumn>) => {
    updateBoardState(prev => ({
      ...prev,
      columns: prev.columns.map((column: KanbanColumn) =>
        column.id === columnId ? { ...column, ...updates } : column
      )
    }));
  }, [updateBoardState]);

  const deleteColumn = useCallback((columnId: string) => {
    updateBoardState(prev => ({
      ...prev,
      columns: prev.columns.filter((col: KanbanColumn) => col.id !== columnId),
      columnOrder: prev.columnOrder.filter((id: string) => id !== columnId),
      cards: prev.cards.filter((card: KanbanCard) => card.columnId !== columnId)
    }));
  }, [updateBoardState]);

  const reorderColumns = useCallback((columnOrder: string[]) => {
    updateBoardState(prev => ({
      ...prev,
      columnOrder
    }));
  }, [updateBoardState]);

  const getColumn = useCallback((columnId: string): KanbanColumn | undefined => {
    return board.columns.find((column: KanbanColumn) => column.id === columnId);
  }, [board.columns]);

  // Board operations
  const updateBoard = useCallback((updates: Partial<KanbanBoard>) => {
    updateBoardState(prev => ({
      ...prev,
      ...updates
    }));
  }, [updateBoardState]);

  const resetBoard = useCallback((newBoard: KanbanBoard) => {
    setBoard(newBoard);
    if (onBoardChange) {
      onBoardChange(newBoard);
    }
  }, [onBoardChange]);

  // Utility functions
  const getColumnCardCount = useCallback((columnId: string): number => {
    return cardsByColumn[columnId]?.length || 0;
  }, [cardsByColumn]);

  const getCardsByPriority = useCallback((priority: KanbanCard['priority']): KanbanCard[] => {
    return board.cards.filter((card: KanbanCard) => card.priority === priority);
  }, [board.cards]);

  const getCardsByAssignee = useCallback((assignee: string): KanbanCard[] => {
    return board.cards.filter((card: KanbanCard) => card.assignee === assignee);
  }, [board.cards]);

  const searchCards = useCallback((query: string): KanbanCard[] => {
    const lowercaseQuery = query.toLowerCase();
    return board.cards.filter((card: KanbanCard) =>
      card.title.toLowerCase().includes(lowercaseQuery) ||
      card.content?.toLowerCase().includes(lowercaseQuery) ||
      card.assignee?.toLowerCase().includes(lowercaseQuery) ||
      card.tags?.some((tag: string) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [board.cards]);

  return {
    board,
    cardsByColumn,
    
    // Card operations
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    getCard,
    
    // Column operations
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    getColumn,
    
    // Board operations
    updateBoard,
    resetBoard,
    
    // Utility functions
    getColumnCardCount,
    getCardsByPriority,
    getCardsByAssignee,
    searchCards
  };
};

// Convenience hooks for common board types
export const useProjectBoard = (options?: UseKanbanOptions) => {
  const defaultBoard: KanbanBoard = {
    id: 'project',
    columnOrder: ['todo', 'in-progress', 'review', 'done'],
    columns: [
      { id: 'todo', title: 'To Do', icon: '📋', allowAdd: true, allowDrop: true },
      { id: 'in-progress', title: 'In Progress', icon: '⚡', allowAdd: true, allowDrop: true },
      { id: 'review', title: 'Review', icon: '👀', allowAdd: true, allowDrop: true },
      { id: 'done', title: 'Done', icon: '✅', allowAdd: false, allowDrop: true }
    ],
    cards: []
  };

  return useKanban({
    initialBoard: defaultBoard,
    ...options
  });
};

export const useSalesBoard = (options?: UseKanbanOptions) => {
  const defaultBoard: KanbanBoard = {
    id: 'sales',
    columnOrder: ['leads', 'qualified', 'proposal', 'negotiation', 'closed'],
    columns: [
      { id: 'leads', title: 'Leads', icon: '🎯', allowAdd: true, allowDrop: true },
      { id: 'qualified', title: 'Qualified', icon: '✅', allowAdd: true, allowDrop: true },
      { id: 'proposal', title: 'Proposal', icon: '📄', allowAdd: true, allowDrop: true },
      { id: 'negotiation', title: 'Negotiation', icon: '🤝', allowAdd: true, allowDrop: true },
      { id: 'closed', title: 'Closed', icon: '💰', allowAdd: false, allowDrop: true }
    ],
    cards: []
  };

  return useKanban({
    initialBoard: defaultBoard,
    ...options
  });
};

export const useTaskBoard = (options?: UseKanbanOptions) => {
  const defaultBoard: KanbanBoard = {
    id: 'tasks',
    columnOrder: ['backlog', 'planned', 'in-progress', 'testing', 'completed'],
    columns: [
      { id: 'backlog', title: 'Backlog', icon: '📦', allowAdd: true, allowDrop: true },
      { id: 'planned', title: 'Planned', icon: '📅', allowAdd: true, allowDrop: true },
      { id: 'in-progress', title: 'In Progress', icon: '⚡', allowAdd: true, allowDrop: true },
      { id: 'testing', title: 'Testing', icon: '🧪', allowAdd: true, allowDrop: true },
      { id: 'completed', title: 'Completed', icon: '✅', allowAdd: false, allowDrop: true }
    ],
    cards: []
  };

  return useKanban({
    initialBoard: defaultBoard,
    ...options
  });
}; 