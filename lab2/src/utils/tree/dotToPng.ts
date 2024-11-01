import { Graph } from 'graphlib';
import * as dot from 'graphlib-dot';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';

// Function to generate DOT file and convert to PNG
export function convertDotToPng(
  graph: Graph,
  outputFilename: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const dotFormat = dot.write(graph);

    if (!existsSync(path.join(__dirname, `../../trees`)))
      await fs.mkdir(path.join(__dirname, `../../trees`));

    // Save the DOT file to the file system
    const dotFilePath = path.join(
      __dirname,
      `../../trees/${outputFilename}.dot`,
    );
    try {
      await fs.writeFile(dotFilePath, dotFormat);
    } catch (err) {
      return reject(err);
    }
    // Use Graphviz 'dot' command to convert DOT to PNG
    const pngFilePath = path.join(
      __dirname,
      `../../trees/${outputFilename}.png`,
    );
    exec(
      `dot -Tpng ${dotFilePath} -o ${pngFilePath}`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(`Error converting DOT to PNG: ${stderr}`);
        }

        console.log(`DOT converted to PNG: ${pngFilePath}`);
        resolve();
      },
    );
  });
}
