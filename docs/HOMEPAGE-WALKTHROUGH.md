# FSM Designer - Homepage Walkthrough

## 🏠 Homepage Overview

The Homepage is your central hub for managing all your FSM diagrams. It provides a clean, organized interface to view, search, sort, and manage your state machine projects.

![Homepage Overview - Placeholder for screenshot showing the main homepage layout]

---

## 🎯 New User Experience

### First-Time User Guide Modal

When you first visit the app (with no existing diagrams), you'll see a beautiful welcome modal:

![New User Guide Modal - Placeholder for screenshot of the mountain landscape modal]

**Features:**

- **Animated Mountain Landscape**: CSS-drawn mountains with twinkling stars
- **Dark Theme Design**: Modern, professional appearance
- **Two Action Options**:
  - **"Create Your First Diagram"**: Opens the new diagram creation modal
  - **"Skip for now"**: Dismisses the guide to explore on your own

**Visual Elements:**

- Gradient blue sky background
- Three mountain silhouettes with rounded peaks
- Five twinkling stars with staggered animations
- Clean typography with "Welcome to FSM Designer" title
- Feature badges: "Free Tool", "Beginner Friendly", "No Setup Required"

---

## 📊 Storage Management

### Storage Gauge

Located next to the "My Diagrams" title, the storage gauge provides real-time monitoring of your browser's storage usage:

![Storage Gauge - Placeholder for screenshot showing the gauge with percentage]

**Features:**

- **Real-time Monitoring**: Updates every 30 seconds
- **Color-coded Progress Bar**:
  - 🟢 **Green** (0-50%): Low usage
  - 🟠 **Orange** (50-85%): Medium usage
  - 🔴 **Red** (85-100%): High usage
- **Detailed Information**:
  - Used storage: "1.2 MB"
  - Total quota: "5.0 GB"
  - Percentage: "(25.0%)" with 1 decimal precision
- **Clear Storage Button**: Trash icon to clear all diagrams

**Clear Storage Process:**

1. Click the trash icon next to the gauge
2. Confirmation modal appears with warning
3. Click "Clear All" to proceed or "Cancel" to abort
4. All diagrams are removed and storage is freed

---

## 🔍 Diagram Management

### Search Functionality

The search bar allows you to quickly find specific diagrams:

![Search Bar - Placeholder for screenshot of the search interface]

**Features:**

- **Real-time Search**: Results update as you type
- **Search Scope**: Searches through diagram names
- **Clear Search**: X button to reset search
- **Search Icon**: Visual indicator for the search field

**Usage:**

- Type any part of a diagram name
- Results filter instantly
- Empty search shows all diagrams

### Sort Options

The sort dropdown provides multiple ways to organize your diagrams:

![Sort Dropdown - Placeholder for screenshot of sort options]

**Sort Categories:**

1. **By Date**:
   - Newest First (default)
   - Oldest First
2. **By Name**:
   - A to Z
   - Z to A
3. **By States**:
   - Most States First
   - Least States First

**Visual Indicators:**

- Current sort option highlighted
- Arrow indicators for sort direction
- Tooltip showing current sort method

### View Modes

Toggle between two viewing options:

![View Mode Toggle - Placeholder for screenshot of grid/list toggle]

**Grid View** (Default):

- Card-based layout
- Visual diagram previews
- Larger touch targets
- Better for browsing

**List View**:

- Compact table format
- More diagrams visible at once
- Better for quick scanning
- Efficient use of space

---

## 📋 Diagram Cards

### Card Layout

Each diagram is displayed as an interactive card:

![Diagram Card - Placeholder for screenshot of a diagram card]

**Card Information:**

- **Diagram Name**: Editable title
- **Type Badge**: FSM, DFA, NFA, etc.
- **State Count**: Number of states in the diagram
- **Last Modified**: Timestamp of last edit
- **Visual Preview**: Thumbnail of the diagram

**Card States:**

- **Default**: Clean, professional appearance
- **Hover**: Subtle elevation and shadow
- **Selected**: Highlighted border and background

### Card Actions

Each card provides multiple action options:

![Card Actions - Placeholder for screenshot showing action buttons]

**Available Actions:**

1. **Open**: Navigate to canvas for editing
2. **Edit**: Rename diagram or change type
3. **Export**: Download in various formats
4. **Delete**: Remove diagram permanently

**Action Buttons:**

- **Primary Action**: Large "Open" button
- **Secondary Actions**: Icon buttons for edit, export, delete
- **Hover Effects**: Visual feedback on interaction

---

## ➕ Creating New Diagrams

### New Diagram Modal

Click the "New Diagram" button to create a new FSM:

![New Diagram Modal - Placeholder for screenshot of the creation modal]

**Form Fields:**

- **Diagram Name**: Required text input
- **Diagram Type**: Dropdown selection
  - Finite State Machine (FSM)
  - Deterministic Finite Automaton (DFA)
  - Non-deterministic Finite Automaton (NFA)
  - Pushdown Automaton (PDA)
  - Turing Machine (TM)

**Validation:**

- Name must be unique
- Name cannot be empty
- Type selection required

**Actions:**

- **Create**: Proceed to canvas
- **Cancel**: Return to homepage

---

## ✏️ Editing Diagrams

### Edit Modal

Access the edit modal by clicking the edit icon on any diagram card:

![Edit Modal - Placeholder for screenshot of the edit form]

**Editable Fields:**

- **Name**: Change diagram title
- **Type**: Modify diagram classification
- **Description**: Add optional notes

**Validation:**

- Name uniqueness checking
- Type validation
- Real-time error feedback

**Actions:**

- **Save**: Apply changes
- **Cancel**: Discard changes

---

## 📤 Export Options

### Export Modal

Click the export icon to access export options:

![Export Modal - Placeholder for screenshot of export options]

**Export Formats:**

1. **PNG**: High-resolution raster image

   - Custom DPI settings
   - Background options
   - Margin controls

2. **SVG**: Scalable vector graphic

   - Perfect for web use
   - Editable in design software
   - Small file size

3. **PDF**: Print-ready document

   - Professional formatting
   - Multiple page support
   - Print optimization

4. **JSON**: Machine-readable format
   - Full diagram data
   - Import/export compatibility
   - Version control friendly

**Export Settings:**

- **Resolution**: 72 DPI to 300 DPI
- **Background**: Include/exclude
- **Margins**: Custom spacing
- **Filename**: Auto-generated or custom

---

## 🎨 Visual Design

### Theme Support

The homepage supports both light and dark themes:

![Light Theme - Placeholder for screenshot of light mode]
![Dark Theme - Placeholder for screenshot of dark mode]

**Light Theme:**

- Clean white background
- Dark text for readability
- Subtle shadows and borders
- Professional appearance

**Dark Theme:**

- Dark gray/black background
- Light text for contrast
- Accent colors for highlights
- Modern, sleek appearance

### Responsive Design

The homepage adapts to different screen sizes:

![Mobile View - Placeholder for mobile screenshot]
![Tablet View - Placeholder for tablet screenshot]
![Desktop View - Placeholder for desktop screenshot]

**Breakpoints:**

- **Mobile**: Single column, stacked layout
- **Tablet**: Two columns, optimized spacing
- **Desktop**: Multi-column, full feature set

---

## ⌨️ Keyboard Shortcuts

### Homepage Shortcuts

Navigate efficiently with keyboard shortcuts:

**Global Shortcuts:**

- `Ctrl+N`: Create new diagram
- `Ctrl+1`: Focus search bar
- `Ctrl+2`: Toggle view mode
- `Esc`: Clear search or close modals

**Navigation:**

- `Tab`: Move between elements
- `Enter`: Open selected diagram
- `Delete`: Delete selected diagram (with confirmation)

---

## 🔧 Advanced Features

### Bulk Operations

Select multiple diagrams for batch operations:

![Bulk Selection - Placeholder for screenshot of multi-select]

**Bulk Actions:**

- **Export Multiple**: Download as ZIP
- **Delete Multiple**: Remove several at once
- **Change Type**: Modify multiple diagrams

### Import Functionality

Import diagrams from external sources:

![Import Modal - Placeholder for screenshot of import options]

**Import Sources:**

- **JSON Files**: Drag and drop
- **URL Import**: Load from web
- **Clipboard**: Paste diagram data

**Validation:**

- Format checking
- Error reporting
- Preview before import

---

## 📊 Statistics & Analytics

### Usage Statistics

Track your diagram creation and usage:

![Statistics Panel - Placeholder for screenshot of stats]

**Metrics Displayed:**

- **Total Diagrams**: Count of all diagrams
- **Storage Used**: Current storage consumption
- **Last Activity**: Most recent edit
- **Most Used Type**: Popular diagram types

### Performance Monitoring

Monitor app performance and health:

**Performance Metrics:**

- **Load Time**: Page load speed
- **Search Speed**: Query response time
- **Export Speed**: File generation time
- **Storage Efficiency**: Space utilization

---

## 🆘 Help & Support

### Contextual Help

Get help without leaving the page:

![Help Tooltip - Placeholder for screenshot of help tooltip]

**Help Features:**

- **Tooltips**: Hover for quick info
- **Help Icons**: Click for detailed help
- **Contextual Guides**: Step-by-step assistance
- **Video Tutorials**: Embedded learning content

### Error Handling

Clear error messages and recovery options:

![Error Message - Placeholder for screenshot of error display]

**Error Types:**

- **Validation Errors**: Form input issues
- **Network Errors**: Connection problems
- **Storage Errors**: Space or permission issues
- **Import Errors**: File format problems

**Recovery Options:**

- **Retry**: Attempt operation again
- **Alternative**: Suggest workarounds
- **Support**: Contact help system

---

## 🎯 Best Practices

### Organization Tips

**Naming Conventions:**

- Use descriptive names
- Include version numbers
- Add project prefixes
- Use consistent formatting

**Categorization:**

- Group related diagrams
- Use type badges effectively
- Add descriptions for context
- Regular cleanup and archiving

### Performance Tips

**Storage Management:**

- Regular cleanup of unused diagrams
- Export important diagrams
- Monitor storage usage
- Use clear storage when needed

**Efficiency:**

- Use search instead of scrolling
- Sort by most recent for active projects
- Use list view for quick scanning
- Keyboard shortcuts for power users

---

## 🔮 Future Enhancements

### Planned Features

**Upcoming Improvements:**

- **Folder Organization**: Group diagrams in folders
- **Tags System**: Categorize with custom tags
- **Favorites**: Mark important diagrams
- **Recent Activity**: Track editing history
- **Collaboration**: Share diagrams with others
- **Templates**: Pre-built diagram templates
- **Version History**: Track diagram changes
- **Cloud Sync**: Access from multiple devices

---

_This homepage walkthrough covers all current features and provides guidance for optimal usage of the FSM Designer homepage interface._
