# 💎 Luxury Invoice Generation System

## Overview

A comprehensive, professional invoice generation system has been implemented for the Ayurvedic Clinic Management System (ACMS). This feature allows creating beautiful, luxury-feeling invoices for patients, retail customers, and wholesale buyers with professional PDF export and print capabilities.

## ✨ Features Implemented

### 1. **Complete Invoice Management**
- ✅ Create invoices for patients, retail, and wholesale customers
- ✅ Auto-generated invoice numbers (INV + Year + Month + Sequential)
- ✅ Multiple invoice types (Patient, Retail, Wholesale)
- ✅ Patient search and auto-fill customer details
- ✅ Line-item based invoicing with unlimited items
- ✅ Medicine inventory integration (auto stock reduction)
- ✅ Consultation fees and additional charges
- ✅ Discount and tax calculations
- ✅ Payment status tracking (Paid, Pending, Partial, Refunded)
- ✅ Payment method recording (Cash, Card, UPI, Mobile, Other)
- ✅ Due date tracking
- ✅ Custom notes and terms & conditions

### 2. **Luxury Invoice Design**
- ✅ **Premium Template**: Professional, elegant design with serif fonts
- ✅ **Gold Accents**: Luxury gold/yellow accent colors
- ✅ **Gradient Backgrounds**: Subtle gradients for visual depth
- ✅ **Icon Integration**: Beautiful SVG icons for contact info
- ✅ **Color-coded Status**: Visual payment status indicators
- ✅ **Professional Layout**: Clean, organized information hierarchy
- ✅ **Signature Lines**: Professional signature sections
- ✅ **Print-optimized**: Styled for perfect printing/PDF export

### 3. **Invoice Operations**
- ✅ View all invoices with search and filters
- ✅ Search by invoice number, customer name, phone
- ✅ Filter by payment status, invoice type, date range
- ✅ Real-time statistics (Total revenue, paid, pending)
- ✅ Mark invoices as paid/pending
- ✅ Print invoices (browser print dialog)
- ✅ Download as PDF (via print to PDF)
- ✅ Update payment information

### 4. **Smart Features**
- ✅ **Medicine Lookup**: Select from available medicines with stock info
- ✅ **Auto-calculation**: Real-time calculation of totals, taxes, discounts
- ✅ **Stock Management**: Automatic inventory deduction on invoice creation
- ✅ **Stock Movement**: Complete audit trail in stock_movements table
- ✅ **Patient Integration**: Search and link to existing patients
- ✅ **GSTIN Support**: GST number for business customers
- ✅ **Multi-currency**: Rupee (₹) formatting

## 📁 Files Created/Modified

### Database
```
backend/src/database/
├── add_bill_items.sql              [NEW] - Bill items table migration
└── schema.sql                      [EXISTING] - Bills table already existed
```

### Backend
```
backend/src/
├── controllers/
│   └── invoice.controller.js       [NEW] - Complete invoice CRUD operations
├── routes/
│   └── invoice.routes.js           [NEW] - Invoice API endpoints
└── server.js                       [MODIFIED] - Added invoice routes
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Invoices.jsx                [NEW] - Invoice list & management
│   ├── CreateInvoice.jsx           [NEW] - Invoice creation form
│   └── InvoiceView.jsx             [NEW] - Invoice view & print
├── components/
│   ├── InvoiceTemplate.jsx         [NEW] - Luxury invoice template
│   └── Layout.jsx                  [MODIFIED] - Added Invoices nav link
└── App.jsx                         [MODIFIED] - Added invoice routes
```

## 🔌 API Endpoints

### Invoice Management
- `GET /api/invoices` - Get all invoices (with filters)
  - Query params: `search`, `payment_status`, `invoice_type`, `start_date`, `end_date`
- `GET /api/invoices/:id` - Get invoice by ID with all items
- `GET /api/invoices/stats` - Get invoice statistics
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice (payment status, notes, etc.)

## 📊 Database Schema

### Bills Table (Extended)
```sql
- id (Primary Key)
- clinic_id (Foreign Key)
- patient_id (Foreign Key) - Optional, for patient invoices
- appointment_id (Foreign Key) - Optional
- bill_number (Unique) - Auto-generated
- customer_name, customer_phone, customer_email - For non-patient customers
- customer_address, customer_gstin - Business customer info
- invoice_type (ENUM: 'patient', 'retail', 'wholesale')
- invoice_date, due_date
- consultation_fee, medicine_cost, additional_charges
- discount, tax, total
- payment_status (ENUM: 'paid', 'pending', 'partial', 'refunded')
- payment_method (ENUM: 'cash', 'card', 'upi', 'mobile', 'other')
- payment_date
- notes, terms_and_conditions
- created_by, created_at, updated_at
```

### Bill Items Table (New)
```sql
- id (Primary Key)
- bill_id (Foreign Key to bills)
- item_type (VARCHAR: 'medicine', 'consultation', 'treatment', 'other')
- medicine_id (Foreign Key to medicines) - NULL for non-medicine items
- item_name (Required)
- description (Text)
- quantity (Decimal)
- unit (VARCHAR: 'units', 'tablets', 'bottles', etc.)
- price_per_unit (Decimal)
- discount (Decimal)
- tax_percentage (Decimal)
- total (Decimal) - Calculated: (qty * price) - discount + tax
- created_at
```

## 🎯 Use Cases

### 1. Creating a Patient Invoice
1. Navigate to Invoices → Click "Create Invoice"
2. Select "Patient Invoice" type
3. Search for patient (auto-fills customer details)
4. Add invoice items:
   - Select medicines from dropdown (auto-fills price)
   - Or manually add items (consultation, treatment, etc.)
   - Set quantity, discount, tax per item
5. Add consultation fee if applicable
6. Add additional charges (if any)
7. Set payment status and method
8. Add notes and terms
9. Click "Create Invoice"
10. System:
    - Generates invoice number
    - Calculates all totals
    - Reduces medicine stock
    - Records stock movements
    - Redirects to invoice view

### 2. Creating a Retail Sale Invoice
1. Click "Create Invoice" → Select "Retail Sale"
2. Manually enter customer details (name, phone required)
3. Add items (medicines or other products)
4. Set payment details
5. Create invoice
6. Print or download PDF

### 3. Viewing and Printing Invoice
1. Click on invoice from list or create new
2. Beautiful luxury template displays
3. Click "Print" → Browser print dialog opens
4. Select printer or "Save as PDF"
5. Professional invoice with:
   - Clinic header with gold accent
   - Customer details in styled boxes
   - Itemized table with all products
   - Totals breakdown
   - Payment status badge
   - Signature lines
   - Terms and conditions

### 4. Managing Invoices
1. **Search**: Type invoice number, customer name, or phone
2. **Filter**: By payment status, invoice type, date range
3. **View Stats**: See total revenue, paid, pending amounts
4. **Update Payment**: Mark as paid/pending from invoice view
5. **Track**: Monitor all invoice activity

## 💎 Luxury Design Elements

### Visual Design
- **Typography**: Georgia serif font for elegance
- **Color Scheme**:
  - Gold/Yellow (#D97706, #F59E0B) for luxury accents
  - Gray gradients for depth
  - Blue accents for customer info
  - Status colors (Green=Paid, Orange=Pending, Blue=Partial)
- **Borders**: 4px gold border at header
- **Shadows**: Deep shadows for depth (shadow-2xl)
- **Backgrounds**: Subtle gradients from gray-50 to gray-100

### Professional Elements
- Company logo area
- Large, bold invoice number
- Structured "From" and "To" sections with icons
- Detailed itemized table
- Clear totals breakdown
- Payment status badge
- Signature sections
- Footer with thank you message

### Print Optimization
- `@media print` styles
- A4 paper size optimization
- Page break handling
- Clean margins
- No background colors in print (optional)
- Professional black and white conversion

## 🔒 Security & Permissions

### Role-Based Access
- **Admin**: Full access to all invoice operations
- **Receptionist**: Can create and manage invoices
- **Pharmacy**: Can create invoices for medicine sales
- **Doctor**: Can view invoices

### Validation
- Required fields: Customer name, phone, items
- Stock validation: Prevents overselling
- Quantity validation: Must be > 0
- Price validation: Must be >= 0
- Automatic calculations prevent manual tampering

## 🚀 How It Works

### Invoice Creation Flow
```
1. User fills form
2. Frontend validates inputs
3. POST /api/invoices with payload
4. Backend starts transaction
5. Generate unique invoice number
6. Calculate item totals
7. Insert invoice record
8. Insert bill items
9. For each medicine item:
   - Reduce stock quantity
   - Record stock movement
10. Commit transaction
11. Return invoice with ID
12. Redirect to invoice view
```

### Invoice Number Generation
```
Format: INV + YY + MM + NNNN
Example: INV250311001
- INV: Prefix
- 25: Year 2025
- 03: Month March
- 1001: Sequential number (padded to 4 digits)

Each month resets the sequence to 0001
```

### Stock Management Integration
```
When invoice created with medicines:
1. Validate stock availability
2. Reduce medicine.quantity_stock
3. Record in stock_movements:
   - type: 'out'
   - quantity: sold quantity
   - reason: 'Sold - Invoice #INV250311001'
   - reference_id: bill_id
   - performed_by: user_id
```

## 📱 User Interface

### Invoice List Page
- Stats cards showing key metrics
- Search bar with instant filtering
- Advanced filters (collapsible)
- Responsive table with all invoices
- Status badges with colors
- Quick actions (view/print)

### Create Invoice Page
- Step-by-step form sections
- Radio buttons for invoice type
- Patient search with autocomplete
- Dynamic item list (add/remove items)
- Medicine dropdown with stock info
- Real-time total calculation
- Visual grand total display
- Payment info section
- Notes and terms text areas

### Invoice View Page
- Action bar with print/download buttons
- Mark as paid button (if pending)
- Full luxury invoice template
- Responsive design
- Print-optimized layout

## 🎨 Design Specifications

### Colors
```css
Primary Gold: #D97706, #F59E0B
Gray Scale: #111827, #1F2937, #374151, #6B7280, #9CA3AF
Success Green: #059669, #10B981
Warning Orange: #EA580C, #F97316
Info Blue: #2563EB, #3B82F6
```

### Typography
```css
Headers: 'Georgia', serif (5xl, 3xl, 2xl)
Body: 'Georgia', serif (sm, base)
Labels: Sans-serif (xs uppercase)
```

### Spacing
```css
Container: max-w-5xl, p-12
Sections: mb-8, mb-10
Cards: p-6, rounded-lg
```

## 🔄 Integration Points

### With Medicine Inventory
- Real-time stock checking
- Automatic stock deduction
- Stock movement recording
- Low stock alerts (existing feature)

### With Patient Management
- Patient search and selection
- Auto-fill patient details
- Link invoice to patient record
- Patient invoice history

### With Appointments
- Optional link to appointment
- Consultation fee from appointment
- Prescription to invoice conversion (future)

## 📈 Statistics & Reporting

### Dashboard Stats
- Total invoices count
- Paid invoices count and amount
- Pending invoices count and amount
- Partial payments count and amount
- Total revenue across all invoices

### Available Metrics
```javascript
{
  total_invoices: 150,
  paid_count: 120,
  paid_amount: 450000.00,
  pending_count: 25,
  pending_amount: 75000.00,
  partial_count: 5,
  partial_amount: 15000.00,
  total_revenue: 540000.00
}
```

## 💡 Best Practices

### For Clinic Staff
1. **Always select medicine from dropdown** when available (ensures stock sync)
2. **Set due dates** for pending payments (typically 15-30 days)
3. **Add detailed notes** for custom arrangements
4. **Update payment status** immediately when paid
5. **Print/email** invoice to customer before they leave

### For Administrators
1. **Review pending invoices** weekly
2. **Follow up** on overdue payments
3. **Reconcile** payments with bank statements
4. **Archive** old invoices periodically
5. **Monitor** stock movement vs invoices

## 🛠️ Technical Details

### Dependencies Added
```json
{
  "react-to-print": "^2.15.1"  // For print functionality
}
```

### Print Functionality
```javascript
useReactToPrint({
  content: () => invoiceRef.current,
  documentTitle: `Invoice-${invoice.bill_number}`,
  onAfterPrint: () => toast.success('Printed')
})
```

### Ref Forwarding
```javascript
const InvoiceTemplate = forwardRef(({ invoice }, ref) => {
  return <div ref={ref}>...</div>
})
```

## 🎓 User Guide

### Creating Your First Invoice

**Step 1: Navigate to Invoices**
- Click "Invoices" in the sidebar

**Step 2: Click "Create Invoice"**
- Green button in top-right

**Step 3: Select Invoice Type**
- Patient: For registered patients
- Retail: For walk-in customers
- Wholesale: For bulk orders

**Step 4: Enter Customer Details**
- For patients: Search and select
- For retail/wholesale: Enter manually
- Phone is required for contact

**Step 5: Add Items**
- Click "+ Add Item" for each product
- Select medicine from dropdown (if applicable)
- Enter quantity and adjust price if needed
- Set discount and tax per item
- See real-time total calculation

**Step 6: Add Charges**
- Consultation Fee: Doctor's fee
- Additional Charges: Any extra costs
- Discount: Overall discount
- Tax: GST or other taxes

**Step 7: Set Payment Info**
- Payment Status: Paid, Pending, or Partial
- Payment Method: Cash, Card, UPI, etc.
- Invoice Date: Default is today
- Due Date: For pending payments

**Step 8: Add Notes (Optional)**
- Special instructions
- Delivery details
- Custom terms

**Step 9: Create Invoice**
- Click "Create Invoice" button
- System generates invoice number
- Redirects to beautiful invoice view

**Step 10: Print or Download**
- Click "Print" for physical copy
- Or "Download PDF" to save

## ✅ Feature Complete

The luxury invoice generation system is now fully functional and ready for production use. All core features have been implemented:

- ✅ Complete invoice CRUD operations
- ✅ Beautiful luxury template design
- ✅ Print and PDF download
- ✅ Stock management integration
- ✅ Patient integration
- ✅ Payment tracking
- ✅ Advanced search and filtering
- ✅ Real-time statistics
- ✅ Mobile-responsive design
- ✅ Role-based permissions

## 🎉 Result

You now have a **professional, luxury-feeling invoice system** that:
- Creates beautiful, printable invoices
- Manages inventory automatically
- Tracks payments effectively
- Provides business insights
- Delights customers with professional documentation

---

**Built with ❤️ for professional healthcare and retail management**
