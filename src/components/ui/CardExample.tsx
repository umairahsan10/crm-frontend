import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

const CardExample: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId);
    console.log('Card clicked:', cardId);
  };

  return (
    <div className="card-examples" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Card Component Examples</h1>
      <p>Explore different card configurations and styling options.</p>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Basic Cards */}
        <section>
          <h2>Basic Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            
            {/* Simple Card */}
            <Card
              title="Simple Card"
              subtitle="A basic card with title and content"
            >
              <p>This is a simple card with just a title, subtitle, and some content. It uses the default styling and layout.</p>
            </Card>

            {/* Card with Actions */}
            <Card
              title="Card with Actions"
              subtitle="Card with action buttons in the header"
              actions={
                <>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="primary">Save</Button>
                </>
              }
            >
              <p>This card has action buttons in the header section. You can add any components as actions.</p>
            </Card>

            {/* Card with Footer */}
            <Card
              title="Card with Footer"
              subtitle="Card with footer content"
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Last updated: 2 hours ago</span>
                  <Button size="sm" variant="ghost">View Details</Button>
                </div>
              }
            >
              <p>This card has a footer section with additional information and actions.</p>
            </Card>

            {/* Card with Custom Header */}
            <Card
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    JD
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>John Doe</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Software Developer</p>
                  </div>
                </div>
              }
              actions={<Button size="sm" variant="outline">Contact</Button>}
            >
              <p>This card uses a custom header with an avatar and user information instead of the default title/subtitle.</p>
            </Card>
          </div>
        </section>

        {/* Card Sizes */}
        <section>
          <h2>Card Sizes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            
            <Card size="xs" title="Extra Small" subtitle="xs size">
              <p>This is an extra small card with minimal padding and smaller text.</p>
            </Card>

            <Card size="sm" title="Small" subtitle="sm size">
              <p>This is a small card with reduced padding and smaller text.</p>
            </Card>

            <Card size="md" title="Medium" subtitle="md size (default)">
              <p>This is a medium card with standard padding and text size.</p>
            </Card>

            <Card size="lg" title="Large" subtitle="lg size">
              <p>This is a large card with increased padding and larger text.</p>
            </Card>

            <Card size="xl" title="Extra Large" subtitle="xl size">
              <p>This is an extra large card with maximum padding and largest text.</p>
            </Card>
          </div>
        </section>

        {/* Card Variants */}
        <section>
          <h2>Card Variants</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            
            <Card variant="default" title="Default" subtitle="Standard card variant">
              <p>This is the default card variant with a white background and subtle border.</p>
            </Card>

            <Card variant="elevated" title="Elevated" subtitle="Card with enhanced shadow">
              <p>This card has an elevated shadow effect for more prominence.</p>
            </Card>

            <Card variant="outlined" title="Outlined" subtitle="Card with border only">
              <p>This card has no background, just a border outline.</p>
            </Card>

            <Card variant="filled" title="Filled" subtitle="Card with background fill">
              <p>This card has a light background fill for subtle emphasis.</p>
            </Card>

            <Card variant="glass" title="Glass" subtitle="Glass morphism effect">
              <p>This card has a glass morphism effect with backdrop blur.</p>
            </Card>

            <Card variant="gradient" title="Gradient" subtitle="Gradient background">
              <p>This card has a beautiful gradient background.</p>
            </Card>
          </div>
        </section>

        {/* Card Shadows */}
        <section>
          <h2>Card Shadows</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            
            <Card shadow="none" title="No Shadow" subtitle="shadow: none">
              <p>This card has no shadow effect.</p>
            </Card>

            <Card shadow="sm" title="Small Shadow" subtitle="shadow: sm">
              <p>This card has a small shadow.</p>
            </Card>

            <Card shadow="md" title="Medium Shadow" subtitle="shadow: md">
              <p>This card has a medium shadow (default).</p>
            </Card>

            <Card shadow="lg" title="Large Shadow" subtitle="shadow: lg">
              <p>This card has a large shadow.</p>
            </Card>

            <Card shadow="xl" title="Extra Large Shadow" subtitle="shadow: xl">
              <p>This card has an extra large shadow.</p>
            </Card>

            <Card shadow="2xl" title="2XL Shadow" subtitle="shadow: 2xl">
              <p>This card has the largest shadow effect.</p>
            </Card>
          </div>
        </section>

        {/* Interactive Cards */}
        <section>
          <h2>Interactive Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            
            <Card
              title="Hoverable Card"
              subtitle="Hover to see the effect"
              hoverable
              onClick={() => handleCardClick('hoverable')}
            >
              <p>This card has a hover effect that lifts it up and adds a shadow.</p>
            </Card>

            <Card
              title="Clickable Card"
              subtitle="Click to interact"
              clickable
              onClick={() => handleCardClick('clickable')}
            >
              <p>This card is clickable and has focus states for accessibility.</p>
            </Card>

            <Card
              title="Selected Card"
              subtitle="Shows selected state"
              className={selectedCard === 'selected' ? 'card--selected' : ''}
              clickable
              onClick={() => handleCardClick('selected')}
            >
              <p>This card shows a selected state when clicked.</p>
            </Card>

            <Card
              title="Loading Card"
              subtitle="Shows loading state"
              loading
            >
              <p>This content won't be visible while loading.</p>
            </Card>
          </div>
        </section>

        {/* Business Cards */}
        <section>
          <h2>Business Use Cases</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            
            {/* Employee Card */}
            <Card
              title="Employee Profile"
              subtitle="Software Developer"
              variant="elevated"
              size="lg"
              actions={
                <>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="primary">View Profile</Button>
                </>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Employee ID: EMP001</span>
                  <span style={{ color: '#10b981' }}>Active</span>
                </div>
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  JD
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>John Doe</h4>
                  <p style={{ margin: 0, color: '#6b7280' }}>john.doe@company.com</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>+1 (555) 123-4567</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong>Department:</strong> Engineering
                </div>
                <div>
                  <strong>Position:</strong> Senior Developer
                </div>
                <div>
                  <strong>Start Date:</strong> Jan 15, 2023
                </div>
                <div>
                  <strong>Location:</strong> New York
                </div>
              </div>
            </Card>

            {/* Lead Card */}
            <Card
              title="Lead Information"
              subtitle="High Priority Lead"
              variant="gradient"
              size="lg"
              customVars={{
                '--card-bg': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              }}
              actions={
                <>
                  <Button size="sm" variant="outline" style={{ color: 'white', borderColor: 'white' }}>
                    Contact
                  </Button>
                  <Button size="sm" variant="primary" style={{ backgroundColor: 'white', color: '#8b5cf6' }}>
                    Convert
                  </Button>
                </>
              }
              footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                  <span>Created: 3 days ago</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    Hot Lead
                  </span>
                </div>
              }
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    AC
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Acme Corporation</h4>
                    <p style={{ margin: 0, opacity: 0.9 }}>Sarah Johnson - CEO</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', opacity: 0.9 }}>
                  <div>
                    <strong>Email:</strong> sarah@acme.com
                  </div>
                  <div>
                    <strong>Phone:</strong> +1 (555) 987-6543
                  </div>
                  <div>
                    <strong>Industry:</strong> Technology
                  </div>
                  <div>
                    <strong>Budget:</strong> $50k - $100k
                  </div>
                </div>
              </div>
            </Card>

            {/* Dashboard Card */}
            <Card
              title="Sales Overview"
              subtitle="This month's performance"
              variant="glass"
              size="lg"
              actions={<Button size="sm" variant="outline">View Details</Button>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>$45,230</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Revenue</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>127</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Leads</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>89%</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Conversion</div>
                </div>
              </div>
              <div style={{ 
                height: '100px', 
                background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #f59e0b 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Performance Chart
              </div>
            </Card>
          </div>
        </section>

        {/* Custom Styled Cards */}
        <section>
          <h2>Custom Styled Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            
            <Card
              title="Custom Border"
              subtitle="With dashed border"
              className="card--border-dashed"
              customVars={{
                '--card-border-color': '#3b82f6',
                '--card-radius': '16px',
              }}
            >
              <p>This card has a custom dashed border and rounded corners.</p>
            </Card>

            <Card
              title="Custom Colors"
              subtitle="Primary theme"
              className="card--primary"
              customVars={{
                '--card-bg': '#eff6ff',
                '--card-border-color': '#bfdbfe',
                '--card-title-color': '#1e40af',
              }}
            >
              <p>This card uses custom colors for a primary theme.</p>
            </Card>

            <Card
              title="Custom Shadow"
              subtitle="Colored shadow"
              className="card--shadow-colored"
              customVars={{
                '--card-shadow': '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
              }}
            >
              <p>This card has a custom colored shadow effect.</p>
            </Card>

            <Card
              title="Custom Padding"
              subtitle="Extra spacious"
              className="card--spacious"
              customVars={{
                '--card-padding': '2rem',
                '--card-radius': '20px',
              }}
            >
              <p>This card has extra padding and larger border radius.</p>
            </Card>

            <Card
              title="Custom Background"
              subtitle="Pattern background"
              className="card--pattern-dots"
              customVars={{
                '--card-bg': '#f8fafc',
              }}
            >
              <p>This card has a custom dot pattern background.</p>
            </Card>

            <Card
              title="Custom Animation"
              subtitle="Bounce effect"
              className="card--bounce"
            >
              <p>This card has a bounce animation when it appears.</p>
            </Card>
          </div>
        </section>

        {/* Responsive Cards */}
        <section>
          <h2>Responsive Cards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            
            <Card
              title="Responsive Card"
              subtitle="Adapts to screen size"
              fullWidth
              className="card--responsive"
            >
              <p>This card uses fullWidth prop and adapts to different screen sizes.</p>
              <div style={{ 
                background: '#f3f4f6', 
                padding: '1rem', 
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <strong>Responsive Features:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                  <li>Adapts to container width</li>
                  <li>Mobile-friendly padding</li>
                  <li>Flexible content layout</li>
                </ul>
              </div>
            </Card>

            <Card
              title="Fixed Height Card"
              subtitle="Consistent height"
              className="card--tall"
              customVars={{
                '--card-min-height': '300px',
              }}
            >
              <p>This card has a fixed minimum height for consistent layout.</p>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '150px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}>
                Content Area
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* Selected Card Display */}
      {selectedCard && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1000,
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h3>Card Clicked!</h3>
          <p>You clicked the card with ID: <strong>{selectedCard}</strong></p>
          <Button onClick={() => setSelectedCard(null)} variant="primary">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardExample; 