import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const colorThemes = [
  'green', 'yellow', 'purple', 'blue', 'red', 'teal', 'orange'
];

export function getCategoryColorClasses(index: number) {
  const theme = colorThemes[index % colorThemes.length];
  
  return {
    card: cn({
      'bg-category-green-bg border-category-green-border text-category-green-fg': theme === 'green',
      'bg-category-yellow-bg border-category-yellow-border text-category-yellow-fg': theme === 'yellow',
      'bg-category-purple-bg border-category-purple-border text-category-purple-fg': theme === 'purple',
      'bg-category-blue-bg border-category-blue-border text-category-blue-fg': theme === 'blue',
      'bg-category-red-bg border-category-red-border text-category-red-fg': theme === 'red',
      'bg-category-teal-bg border-category-teal-border text-category-teal-fg': theme === 'teal',
      'bg-category-orange-bg border-category-orange-border text-category-orange-fg': theme === 'orange',
    }),
    button: cn({
      'bg-category-green-fg/10 text-category-green-fg hover:bg-category-green-fg/20': theme === 'green',
      'bg-category-yellow-fg/10 text-category-yellow-fg hover:bg-category-yellow-fg/20': theme === 'yellow',
      'bg-category-purple-fg/10 text-category-purple-fg hover:bg-category-purple-fg/20': theme === 'purple',
      'bg-category-blue-fg/10 text-category-blue-fg hover:bg-category-blue-fg/20': theme === 'blue',
      'bg-category-red-fg/10 text-category-red-fg hover:bg-category-red-fg/20': theme === 'red',
      'bg-category-teal-fg/10 text-category-teal-fg hover:bg-category-teal-fg/20': theme === 'teal',
      'bg-category-orange-fg/10 text-category-orange-fg hover:bg-category-orange-fg/20': theme === 'orange',
    }),
    progress: cn({
        'bg-category-green-fg': theme === 'green',
        'bg-category-yellow-fg': theme === 'yellow',
        'bg-category-purple-fg': theme === 'purple',
        'bg-category-blue-fg': theme === 'blue',
        'bg-category-red-fg': theme === 'red',
        'bg-category-teal-fg': theme === 'teal',
        'bg-category-orange-fg': theme === 'orange',
    })
  }
};

    