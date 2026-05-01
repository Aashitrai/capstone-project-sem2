/** @type {import('tailwindcss').Config} */
// This file tells Tailwind which files to scan for class names.
// It only includes CSS for classes you actually use (tree-shaking).
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
