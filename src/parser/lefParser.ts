export interface Layer {
  name: string;
  type: string;
  width?: number;
  spacing?: number;
}

export interface ViaLayer {
  layer: string;
  rects: number[][];
}

export interface Via {
  name: string;
  layers: ViaLayer[];
}

export interface LefData {
  layers: Layer[];
  vias: Via[];
}
// Fix Parsing of SAME LAYER RECTs
export function parseLef(lefText: string): LefData {
  // console.log(lefText);
  const lines = lefText.split(/\r?\n/);
  const layers: Layer[] = [];
  const vias: Via[] = [];

  let currentLayer: Partial<Layer> = {};
  let currentVia: Partial<Via> = {};
  let currentViaRects: ViaLayer[] = [];
  let inVia = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // if (!inVia) {console.log("Processing LAYER line:", trimmed);}
    // if (inVia) {console.log("Processing VIA line:", trimmed);}
    if (trimmed.startsWith("LAYER") && !inVia) {
      currentLayer = { name: trimmed.split(" ")[1] };
    } else if (trimmed.startsWith("TYPE") && !inVia) {
      currentLayer.type = trimmed.split(" ")[1].replace(";", "");
    } else if (trimmed.startsWith("WIDTH") && !inVia) {
      currentLayer.width = parseFloat(trimmed.split(" ")[1]);
    } else if (trimmed.startsWith("SPACING") && !inVia) {
      currentLayer.spacing = parseFloat(trimmed.split(" ")[1]);
    } else if (trimmed.startsWith("VIA")) {
      currentVia = { name: trimmed.split(" ")[1] };
      currentViaRects = [];
      inVia = true;
    } else if (inVia && trimmed.startsWith("LAYER")) {
      const layerName = trimmed.split(" ")[1];
      currentViaRects.push({ layer: layerName, rects: [] });
    } else if (inVia && trimmed.startsWith("RECT")) {
    //   const coords = trimmed
    //     .replace(";", "")
    //     .split(/\s+/)
    //     .slice(1)
    //     .map(parseFloat);
    const match = trimmed.match(/[-+]?\d*\.?\d+/g);
    const coords = match ? match.map(parseFloat) : [];
      if (currentViaRects.length > 0) {
        currentViaRects[currentViaRects.length - 1].rects.push(coords);
      }
      // console.log("Adding RECT to VIA:", coords);
      // console.log("Current VIA rects:", currentViaRects);
    } else if (trimmed.startsWith("END")) {
      const endName = trimmed.split(" ")[1];
      if (!inVia && currentLayer.name === endName) {
        layers.push(currentLayer as Layer);
        currentLayer = {};
      } else if (inVia && currentVia.name === endName) {
        currentVia.layers = currentViaRects;
        vias.push(currentVia as Via);
        currentVia = {};
        currentViaRects = [];
        inVia = false;
      }
    }
  }
  // console.log("Parsed layers:", layers);
  // console.log("Parsed vias:", vias);
  return { layers, vias };
}