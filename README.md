# Food Delivery Backend - Microservices Edition

Welcome to the Food Delivery Backend project! This repository aims to provide a scalable and efficient solution for food delivery services using Node.js and TypeScript. Initially developed as a monolith, we have ambitious plans to evolve it into a robust microservices-based architecture.

## Table of Contents

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This project serves as the backend infrastructure for restaurants to manage food delivery services. We leverage the power of Node.js and TypeScript to create a fast and maintainable codebase. While it starts as a monolith, we intend to move towards a microservices architecture for enhanced scalability and flexibility.

## Architecture

Our architecture aims to provide a seamless experience for restaurants, customers, and delivery personnel. Currently, we follow a monolith approach, but we plan to transition into microservices, dividing the system into smaller, independent components for better maintainability and scalability.

## Features

- User authentication and authorization
- Restaurant management
- Menu and item management
- Order placement and tracking
- Delivery personnel tracking
- Payment gateway integration

## Getting Started

To run this project on your local machine, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/satyajitnayk/Foody.git
cd Foody
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database (MySQL, PostgreSQL, or MongoDB).

4. Configure environment variables (e.g., database connection details, API keys) in `.env` file.

5. Run the development server:

```bash
npm run dev
```

6. Access the API at `http://localhost:3000`.

## Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or performance improvements, feel free to open an issue or submit a pull request. Let's work together to create the best food delivery backend!
