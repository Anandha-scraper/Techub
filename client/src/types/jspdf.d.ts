declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: { orientation?: string; unit?: string; format?: string });
    setFontSize(size: number): void;
    text(text: string, x: number, y: number): void;
    save(filename: string): void;
  }
}

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: string[][];
    styles?: { fontSize?: number };
    headStyles?: { fillColor?: number[] };
  }
  
  function autoTable(doc: any, options: AutoTableOptions): void;
  export default autoTable;
}


