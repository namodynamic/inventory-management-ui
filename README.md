# Inventory Management System

This is a full-stack **Inventory Management System** built with [Next.js](https://nextjs.org) for the frontend and [Django REST Framework (DRF)](https://www.django-rest-framework.org/) for the backend. The system allows users to manage inventory, track stock levels, view trends, and monitor low-stock alerts.

![Dashboard dark theme](https://github.com/user-attachments/assets/9898d605-0843-4d15-b397-92f48dc4624a)


## Features

- **Dashboard**: Displays inventory trends, low-stock alerts, and recent activity.
- **Inventory Management**: Add, update, and delete inventory items.
- **Category Management**: Organize inventory into categories.
- **Charts and Analytics**: Visualize inventory trends and stock levels using interactive charts.
- **Authentication**: Secure login and registration system.
- **Responsive Design**: Fully responsive UI for desktop and mobile devices.
- **Search Functionality**: Search inevntory items by name, category or sku.
- **Filtering & Sorting**: Sort and filter inventory item by category, price.

## Live Demo

You can view the live application here:

[Live Demo](https://namo-inventory-ui.vercel.app)

## Backend API

The backend API for this project is built with Django REST Framework. You can find the API documentation and endpoints here:

[API Documentation](https://namodynamic1.pythonanywhere.com/swagger/)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (v3.9 or later) for the backend

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/namodynamic/inventory-management-ui.git
   cd inventory-management-ui
   ```

2. Install dependencies:

   ```bash
   npm install
    # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the development server:

   ```bash
   npm run dev
    # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Backend Setup

The backend is built using Django REST Framework. Follow the instructions in the [backend repository](https://github.com/namodynamic/inventory-management-api) to set up it up.

## Technologies Used

Frontend

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [TypeScript](https://www.typescriptlang.org/) - Strongly typed programming language that builds on JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library  

Backend

- [Django](https://www.djangoproject.com/) - Python web framework
- [Django REST Framework](https://www.django-rest-framework.org/) - REST framework for Django
- [PostgreSQL](https://www.postgresql.org/) - Relational database management system  

## Screenshots

![Dashboard light theme](https://github.com/user-attachments/assets/45ff608b-08cf-4b62-acc1-9b7e4ac1530b)


![iventory management ](https://github.com/user-attachments/assets/4244519b-2845-4cee-9eec-26e490f391f5)

