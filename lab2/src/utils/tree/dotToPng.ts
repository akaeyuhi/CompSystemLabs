import { Graph } from 'graphlib';
import * as dot from 'graphlib-dot';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import { existsSync, rmSync } from 'fs';
import * as path from 'path';

// Function to generate DOT file and convert to PNG
export function convertDotToPng(
  graph: Graph,
  outputFilename: string,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const dotFormat = dot.write(graph);

    let finalFileName;

    if (outputFilename.includes('Commutative')) {
      finalFileName = 'commutative/' + outputFilename;
    } else if (outputFilename.includes('Distributive')) {
      finalFileName = 'distributive/' + outputFilename;
    } else {
      finalFileName = outputFilename;
    }

    // Save the DOT file to the file system
    const dotFilePath = path.join(
      __dirname,
      `../../trees/${finalFileName}.dot`,
    );
    try {
      await fs.writeFile(dotFilePath, dotFormat);
    } catch (err) {
      return reject(err);
    }
    // Use Graphviz 'dot' command to convert DOT to PNG
    const pngFilePath = path.join(
      __dirname,
      `../../trees/${finalFileName}.png`,
    );
    exec(
      `dot -Tpng ${dotFilePath} -o ${pngFilePath}`,
      async (err, stdout, stderr) => {
        if (err) {
          return reject(`Error converting DOT to PNG: ${stderr}`);
        }

        //console.log(`DOT converted to PNG: ${pngFilePath}`);
        await fs.unlink(dotFilePath);
        resolve();
      },
    );
  });
}

export async function prepareOutput() {
  if (existsSync(path.join(__dirname, `../../trees`))) {
    rmSync(path.join(__dirname, `../../trees`), {
      recursive: true,
      force: true,
    });
  }
  await fs.mkdir(path.join(__dirname, `../../trees`));

  const commDir = path.join(__dirname, `../../trees/commutative`);
  const distDir = path.join(__dirname, `../../trees/distributive`);

  await fs.mkdir(commDir);
  await fs.mkdir(distDir);
}
