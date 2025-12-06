# FinBoard 📈

FinBoard is a modern, interactive financial dashboard application built to provide real-time insights and customizable data visualization. Built with the latest web technologies, it offers a seamless and responsive user experience.

## ✨ Features

- **Interactive Dashboard**
  - specific layouts with drag-and-drop capabilities.
  - Resizable widgets to prioritize important information.
- **Data Visualization**
  - Rich charts and graphs powered by **Recharts**.
  - Real-time data updates using **TanStack React Query**.
- **Widget System**
  - **Financial Cards**: Quick summaries of key metrics.
  - **Configurable Widgets**: Customize data sources and display types.
  - **Widget Management**: Easy-to-use modals for adding and configuring widgets.
- **Modern UI/UX**
  - Sleek, responsive design built with **Tailwind CSS 4**.
  - Dark/Light mode support.
  - Smooth animations and transitions.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Charts:** [Recharts](https://recharts.org/)
- **Layout Engine:** [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
- **HTTP Client:** [Axios](https://axios-http.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/finboard.git
   cd finboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## 📂 Project Structure

```bash
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable React components
│   ├── Dashboard/    # Dashboard-specific layout components
│   ├── Modals/       # Configuration and interaction modals
│   └── Widgets/      # Specific widget components (FinanceCard, etc.)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and shared libraries
├── store/            # Zustand state management stores
└── types/            # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).
