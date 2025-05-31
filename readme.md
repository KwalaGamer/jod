# Inventory Management System

## Overview

A comprehensive inventory management system with responsive design, dark mode support, and multiple functional modules for managing products, sales, workers, customers, and more. Built with HTML, CSS, JavaScript, and Node.js for backend data storage.

## Features

- **User Authentication**: Login portal with different user roles
- **Dashboard**: Overview with statistics and charts
- **Inventory Management**:
  - Track raw materials and finished products
  - Add, edit, and delete items
  - Upload product images
- **Sales Management**: Record sales and track inventory reduction
- **Worker Management**: Track worker consumption
- **Customer Management**: Maintain customer records
- **Importer Tracking**: Monitor imported items
- **User Management**: Create users with permissions
- **Activity Logs**: Track all system activities
- **Data Visualization**:
  - Bar graphs for worker consumption
  - Customer purchase trends
  - Importer statistics
- **Responsive Design**: Works on both mobile and desktop
- **Dark Mode**: Toggle between light and dark themes

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Charts**: Chart.js
- **Backend**: Node.js with Express
- **Data Storage**: JSON files in `data` directory
- **Styling**: Custom CSS with purple/white color scheme

## Project Structure

```
inventory-system/
├── data/                   # Folder to store all data
├── css/                    # Stylesheets
│   ├── style.css           # Main stylesheet
│   └── dark-mode.css       # Dark mode styles
├── js/                     # JavaScript files
│   ├── main.js             # Main JavaScript file
│   ├── auth.js             # Authentication functions
│   ├── dashboard.js        # Dashboard functionality
│   ├── inventory.js        # Inventory management
│   ├── sales.js            # Sales management
│   ├── workers.js          # Workers management
│   ├── customers.js        # Customers management
│   ├── importers.js        # Importers management
│   ├── users.js            # User management
│   ├── logs.js             # Logs management
│   └── charts.js           # Chart generation
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── inventory.html          # Inventory page
├── sales.html              # Sales page
├── workers.html            # Workers page
├── customers.html          # Customers page
├── importers.html          # Importers page
├── users.html              # Users page
├── logs.html               # Logs page
└── server.js               # Node.js server
```

## Installation

1. **Prerequisites**:
   - Node.js (v14 or later)
   - npm (comes with Node.js)

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/inventory-system.git
   cd inventory-system
   ```

3. **Install dependencies**:
   ```bash
   npm install express body-parser
   ```

4. **Create data directory**:
   ```bash
   mkdir data
   ```

## Running the Application

1. **Start the server**:
   ```bash
   node server.js
   ```

2. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Default Credentials

The system comes with sample users:

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | admin123   | admin   |
| manager  | manager123 | manager |
| staff    | staff123   | staff   |

## Configuration

- **Port**: Change the port in `server.js` if needed
- **Data Storage**: All data is stored in JSON files in the `data` directory
- **Color Scheme**: Modify colors in `css/style.css` and `css/dark-mode.css`

## Usage

1. **Login**: Use one of the default credentials or create new users
2. **Dashboard**: View system overview with statistics and charts
3. **Inventory**:
   - Add raw materials or finished products
   - Update quantities as items are used or received
4. **Sales**:
   - Record customer sales
   - System automatically deducts from inventory
5. **Reports**:
   - View worker consumption
   - Analyze customer purchases
   - Track import activities

## Development

To modify or extend the system:

1. **Add new pages**:
   - Create new HTML file
   - Add corresponding JavaScript file in `js/` directory
   - Update navigation in all pages

2. **Modify styles**:
   - Edit `style.css` for light mode
   - Edit `dark-mode.css` for dark mode styles

3. **Add new features**:
   - Create new endpoints in `server.js` if needed
   - Update the corresponding JavaScript file

## Security Considerations

This is a development version. For production use:

1. Implement proper password hashing
2. Add input validation
3. Implement CSRF protection
4. Use HTTPS
5. Add proper user role permissions
6. Consider using a proper database instead of JSON files

## License

This project is open-source and available under the MIT License.

## Support

For issues or feature requests, please open an issue on the GitHub repository.