import * as fs from 'fs';

export async function writeErrorFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.promises.writeFile(filePath, content, 'utf8');
}
