
'use server';

import * as prettier from 'prettier';
import * as prettierPluginApex from 'prettier-plugin-apex';

export async function prettifyApexCode(code: string): Promise<{ success: boolean, formattedCode?: string, error?: string }> {
  try {
    const formattedCode = await prettier.format(code, {
      parser: 'apex',
      plugins: [prettierPluginApex],
    });
    return { success: true, formattedCode };
  } catch (error: any) {
    console.error("Prettier formatting failed on server:", error);
    return { success: false, error: error.message || "Failed to format code." };
  }
}
