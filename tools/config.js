import fs from 'fs';
import prompts from 'prompts';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const onState = ({ aborted }) => {
  if (aborted) {
    process.exit();
  }
}

export class Config {
  constructor() {
    this.config = JSON.parse((fs.readFileSync(`${__dirname}/.config.json`)).toString());
  }

  get numberOfLetters() {
    return this.config.numberOfLetters;
  }

  get lettersBucketName() {
    return this.config.lettersBucketName;
  }

  get lettersTable() {
    return this.config.lettersTable;
  }

  get toysTable() {
    return this.config.toysTable;
  }

  async getLettersBucketName() {
    let bucketName;
    do {
      const { value } = await prompts({
        type: 'text',
        name: 'value',
        message: `Entrez le nom du bucket S3 où envoyer les lettres:`,
        initial: this.config.lettersBucketName,
        onState,
      });
      bucketName = value;
    } while(!bucketName);
    this.config.lettersBucketName = bucketName;
    this.saveConfig();
    return this.config.lettersBucketName;
  }

  async getNumberOfLetters() {
    const { value } = await prompts({
      type: 'number',
      name: 'value',
      message: `Combien de lettre voulez-vous générer ?`,
      initial: this.config.numberOfLetters || 1,
      onState,
    });
    this.config.numberOfLetters = value;
    this.saveConfig();
    return this.config.numberOfLetters;
  }

  async getLettersTable() {
    let lettersTable;
    do {
      const { value } = await prompts({
        type: 'text',
        name: 'value',
        message: `Entrez le nom de la table des lettres:`,
        initial: this.config.lettersTable,
        onState,
      });
      lettersTable = value;
    } while(!lettersTable);
    this.config.lettersTable = lettersTable;
    this.saveConfig();
    return this.config.lettersTable;
  }

  async getToysTable() {
    let toysTable;
    do {
      const { value } = await prompts({
        type: 'text',
        name: 'value',
        message: `Entrez le nom de la table des lettres:`,
        initial: this.config.toysTable,
        onState,
      });
      toysTable = value;
    } while(!toysTable);
    this.config.toysTable = toysTable;
    this.saveConfig();
    return this.config.toysTable;
  }

  saveConfig() {
    fs.writeFileSync(`${__dirname}/.config.json`, JSON.stringify(this.config, null, 2));
  }

}