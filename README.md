# Car Rental System

A full-stack car rental management system built with Laravel (back-end) and React (front-end).

## Project Structure

- `/back-end`: Laravel API with admin and user endpoints
- `/front-end`: React application with client and admin interfaces

## Setup Instructions

### Back-end Setup
1. Navigate to the back-end directory: `cd back-end`
2. Install PHP dependencies: `composer install`
3. Copy .env.example: `cp .env.example .env`
4. Configure database settings in .env
5. Generate app key: `php artisan key:generate`
6. Run migrations: `php artisan migrate`
7. Start server: `php artisan serve`

### Front-end Setup
1. Navigate to the front-end directory: `cd front-end`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Features

- User authentication and authorization
- Car listing and search
- Booking management
- Admin dashboard
- Payment processing