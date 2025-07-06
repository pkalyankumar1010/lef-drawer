(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

  }
  window.addEventListener('resize', resize);
  resize();

  const layerColors = [
    '#0077cc', '#cc3300', '#33cc33', '#9966ff', '#ffaa00', '#00aaaa', '#ff33aa'
  ];
  let colorIndex = 0;
  const colorMap = {};

    function drawPattern(type, color) {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 10;
    patternCanvas.height = 10;
    const pctx = patternCanvas.getContext('2d');
    pctx.strokeStyle = color;
    pctx.fillStyle = color;
    pctx.lineWidth = 1;

    if (type === 'slash') {
      pctx.beginPath();
      pctx.moveTo(0, 10);
      pctx.lineTo(10, 0);
      pctx.stroke();
    } else if (type === 'backslash') {
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(10, 10);
      pctx.stroke();
    } else if (type === 'dot') {
      pctx.beginPath();
      pctx.arc(5, 5, 1.5, 0, Math.PI * 2);
      pctx.fill();
    }

    return ctx.createPattern(patternCanvas, 'repeat');
  }

  function draw(lefData) {
        console.log('Drawing LEF data:', lefData);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Legend
    let legendY = 20;
    for (const layer of lefData.layers) {
      const color = colorMap[layer.name] ||= layerColors[colorIndex++ % layerColors.length];
      ctx.fillStyle = color;
      ctx.fillRect(20, legendY, 100, 10);
      ctx.fillText(layer.name, 130, legendY + 10);
      legendY += 20;
    }

    const cols = 4;
    const spacing = 200;
    const scale = 50;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - scrollOffsetY;

    ctx.save();
    ctx.translate(centerX, centerY);

    lefData.vias.forEach((via, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const offsetX = (col - (cols / 2 - 0.5)) * spacing;
      const offsetY = row * spacing;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, -scale);

      // draw via layers with patterns
      via.layers.forEach((vl, i) => {
        const baseColor = colorMap[vl.layer] || '#999';
        const isVia = vl.layer.toLowerCase().includes('via');
        const patternType = isVia ? 'dot' : (i % 2 === 0 ? 'slash' : 'backslash');
        ctx.fillStyle = drawPattern(patternType, baseColor);
        ctx.strokeStyle = baseColor;

        for (const r of vl.rects) {
          const [x1, y1, x2, y2] = r;
          const w = x2 - x1;
          const h = y2 - y1;
          ctx.fillRect(x1, y1, w, h);
          ctx.strokeRect(x1, y1, w, h);
        }
      });

      ctx.restore();

      // draw via name
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(via.name, offsetX, offsetY + spacing / 2 - 20);

      // draw edge cross marker
      ctx.beginPath();
      ctx.moveTo(offsetX - 5, offsetY);
      ctx.lineTo(offsetX + 5, offsetY);
      ctx.moveTo(offsetX, offsetY - 5);
      ctx.lineTo(offsetX, offsetY + 5);
      ctx.strokeStyle = '#888';
      ctx.stroke();
    });

    ctx.restore();
  }

  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg.type === 'update') {
      draw(msg.data);
    }
  });
})();