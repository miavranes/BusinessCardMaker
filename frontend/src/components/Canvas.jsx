import { useState, useRef, useEffect, forwardRef } from 'react';
import '../css/Canvas.css';

const Canvas = forwardRef(({ 
  elements, 
  selectedElement, 
  setSelectedElement, 
  onUpdateElement,
  backgroundColor,
  showPreview 
}, ref) => {
    const containerRef = useRef(null);
    const [dragging, setDragging] = useState(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const canvasWidth = 1000;
    const canvasHeight = 600;

    useEffect(() => {
        drawCanvas();
    }, [elements, selectedElement, backgroundColor]);

    const drawCanvas = () => {
        const canvas = ref.current;
        if(!canvas) return;

        const ctx = canvas.getContext('2d');
     
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect (0, 0, canvasWidth, canvasHeight);

        elements.forEach(element =>{
            if (element.type === 'text'){
                drawText(ctx, element);
            }else if (element.type === 'shape'){
                drawShape(ctx, element);
            }else if (element.type ==='image'){
                drawImage(ctx, element);
            }


            if(!showPreview && element.id === selectedElement){
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.setLineDash([5,5]);

                const bounds = getElementBounds(element);
                ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
                ctx.setLineDash([]);
            }
        });
    };

    const drawText = (ctx, element) =>{
        ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'}
        ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = element.align || 'left';
        ctx.textBaseline = 'top';

        const lines = element.content.split('\n');
        const lineHeight = element.fontSize * (element.lineHeight || 1.2);

        lines.forEach((line, index) =>{
            const x = element.x;
            const y = element.y + (index * lineHeight);
            ctx.fillText(line, x, y);

            if(element.textDecoration === 'underline'){
                const metrics = ctx.measureText(line);
                ctx.beginPath();
                ctx.strokeStyle = element.color;
                ctx.lineWidth = 1;
                ctx.moveTo(x - (element.align === 'center' ? metrics.width / 2 : 0), y + element.fontSize);
                ctx.lineTo(x + (element.align === 'center' ? metrics.width / 2 : metrics.width), y + element.fontSize);
                ctx.stroke();
            }
        });
    };


    const drawShape = (ctx, element) =>{
        ctx.fillStyle = element.fill || '#3b82f6';

        if(element.strokeWidth > 0){
            ctx.strokeStyle = element.stroke || '#000000';
            ctx.lineWidth = element.strokeWidth;
        }

        if(element.shapeType === 'rectangle'){
            if(element.borderRadius > 0){
                roundRect(ctx, element.x, element.y, element.width, element.height, element.borderRadius);
                ctx.fill();
                if(element.strokeWidth > 0) 
                    ctx.stroke();
            }else{
                ctx.fillRect(element.x, element.y, element.width, element.height);
                if(element.strokeWidth > 0){
                    ctx.strokeRect(element.x, element.y, element.width, element.height);
                }
            }
        }else if (element.shapeType === 'circle'){
            ctx.beginPath();
            ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, 0, Math.PI * 2);
            ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.shapeType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(element.x + element.width / 2, element.y);
      ctx.lineTo(element.x + element.width, element.y + element.height);
      ctx.lineTo(element.x, element.y + element.height);
      ctx.closePath();
      ctx.fill();
      if (element.strokeWidth > 0) ctx.stroke();
    } else if (element.shapeType === 'line') {
      ctx.beginPath();
      ctx.strokeStyle = element.fill;
      ctx.lineWidth = element.height || 2;
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(element.x + element.width, element.y);
      ctx.stroke();
    }
  };

  const drawImage = (ctx, element) => {
    if(element.imgElement){
        ctx.drawImage(element.imgElement, element.x, element.y, element.width, element.height);
    }
  };

  const getElementBounds = (element) => {
  if (element.type === 'text') {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');

    ctx.font = `${element.fontStyle || 'normal'} ${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily}`;

    const lines = element.content.split('\n');
    const lineHeight = element.fontSize * (element.lineHeight || 1.2);

    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });

    return {
      x: element.x,
      y: element.y,
      width: maxWidth,
      height: lines.length * lineHeight
    };
  }

  if (element.type === 'shape' || element.type === 'image') {
    return {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    };
  }

  return { x: 0, y: 0, width: 0, height: 0 };
};

const handleMouseDown = (e) =>{
    if(showPreview) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const bounds = getElementBounds(element);
      
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        setSelectedElement(element.id);
        setDragging(element.id);
        setOffset({
          x: x - element.x,
          y: y - element.y
        });
        return;
      }
    }

    setSelectedElement(null);
};

const  handleMouseMove = (e) => {
    if (!dragging || showPreview) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;

    onUpdateElement(dragging, { x, y });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

return (
    <div ref={containerRef} className="canvas-container">
      <div className="canvas-wrapper">
        <canvas 
          ref={ref} 
          width={canvasWidth} 
          height={canvasHeight}
          onMouseDown={handleMouseDown} 
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} 
          onMouseLeave={handleMouseUp} 
          className={`canvas-element ${showPreview ? '' : 'draggable'}`}
        />
      </div>
    </div>
);
  
});

Canvas.displayName = 'Canvas';

export default Canvas;