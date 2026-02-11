import { useState, useRef } from 'react';
import Canvas from '../components/Canvas';
import Navbar from '../components/Navbar';
import '../css/Editor.css';

function Editor() {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const addText = () => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'New text',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      align: 'left'
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addShape = (shapeType) => {
    const newElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#000000',
      strokeWidth: 0,
      borderRadius: 0
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="editor-container">
      <Navbar 
        onAddText={addText}
        onAddShape={addShape}
        backgroundColor={backgroundColor}
        onBackgroundChange={setBackgroundColor}
        selectedElement={selectedElementData}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
      />

      <div className="canvas-area">
        <Canvas
          ref={canvasRef}
          elements={elements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          onUpdateElement={updateElement}
          backgroundColor={backgroundColor}
          showPreview={false}
        />
      </div>


    </div>
  );
}

export default Editor;
