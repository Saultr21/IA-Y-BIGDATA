const canvas = document.getElementById('umlCanvas');
const ctx = canvas.getContext('2d');
let selectedClass = null;
let offsetX, offsetY;
let selectedRelation = null;
let draggingRelation = false;
let startDragX, startDragY;

const classes = [];
const relations = [];

class UMLClass {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = 180;
        this.height = 70; // Incluye espacio para las líneas de separación
        this.attributes = [];
        this.methods = [];
    }

    draw() {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillText(this.name, this.x + 10, this.y + 15);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 20); // Línea bajo el nombre de la clase
        ctx.lineTo(this.x + this.width, this.y + 20);
        ctx.stroke();

        let yPosition = this.y + 35;
        this.attributes.forEach(attr => {
            ctx.fillText(attr, this.x + 10, yPosition);
            yPosition += 15;
        });

        ctx.beginPath();
        ctx.moveTo(this.x, yPosition); // Línea bajo los atributos
        ctx.lineTo(this.x + this.width, yPosition);
        ctx.stroke();

        yPosition += 15;
        this.methods.forEach(meth => {
            ctx.fillText(meth, this.x + 10, yPosition);
            yPosition += 15;
        });

        this.height = Math.max(70, yPosition - this.y + 10); // Actualizar la altura de la clase
    }

    addAttribute(attr) {
        this.attributes.push(attr);
    }

    addMethod(method) {
        this.methods.push(method);
    }
	
	
	
	
}

class Relation {
    constructor(fromClass, toClass, type, fromMultiplicity, toMultiplicity) {
        this.fromClass = fromClass;
        this.toClass = toClass;
        this.type = type;
        this.fromMultiplicity = fromMultiplicity;
        this.toMultiplicity = toMultiplicity;
        this.offset = 0; // Offset inicial
    }
draw() {
    const { fromX, fromY, toX, toY } = calculateLinePoints(this.fromClass, this.toClass, this.offset);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);

    if (this.type === 'dependencia') {
        ctx.setLineDash([4, 4]); // Línea discontinua para dependencia
    }

    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dibuja las flechas o adornos según el tipo de relación
    if (this.type === 'herencia') {
        drawInheritanceArrow(toX, toY, fromX, fromY);
    } else if (this.type === 'composición') {
        drawCompositionDiamond(fromX, fromY, toX, toY);
    } else if (this.type === 'agregación') {
        drawAgregationDiamond(fromX, fromY, toX, toY);
    } else if (this.type === 'dependencia' || this.type === 'asociaciónDireccional') {
        drawFlecha(fromX, fromY, toX, toY);
    }

    // Mostrar multiplicidades (excepto para herencia y dependencia)
    if (this.type !== 'herencia' && this.type !== 'dependencia') {
        ctx.font = '12px Arial';
        ctx.fillText(this.fromMultiplicity, fromX - 10, fromY - 5);
        ctx.fillText(this.toMultiplicity, toX + 5, toY + 15);
    }
}

   draw() {
          if (this.fromClass === this.toClass) {
            drawReflexiveArrow(this.fromClass, this.toMultiplicity);
        } else {
            const { fromX, fromY, toX, toY } = calculateLinePoints(this.fromClass, this.toClass, this.offset);

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            if (this.type === 'dependencia') {
                ctx.setLineDash([4, 4]); // Define el patrón de la línea discontinua
            }
            ctx.lineTo(toX, toY);
            ctx.stroke();
            ctx.setLineDash([]);

            if (this.type === 'herencia') {
                drawInheritanceArrow(toX, toY, fromX, fromY);
            }
            if (this.type === 'composición') {
                drawCompositionDiamond(fromX, fromY, toX, toY);
            }
            if (this.type === 'agregación') {
                drawAgregationDiamond(fromX, fromY, toX, toY);
            }
            if (this.type === 'dependencia' || this.type === 'asociaciónDireccional') {
                drawFlecha(fromX, fromY, toX, toY);
            }
            if ((this.type !== 'herencia') && (this.type !== 'dependencia')) {
                ctx.font = '12px Arial';
                ctx.fillText(this.fromMultiplicity, fromX - 10, fromY - 5);
                ctx.fillText(this.toMultiplicity, toX + 5, toY + 15);
            }
        }
    }

    setOffset(offset) {
        this.offset = offset;
    }
}








function drawReflexiveArrow(cls, multiplicity) {
    const startX = cls.x + cls.width / 2;
    const startY = cls.y;
    const loopWidth = 40;
    const loopHeight = 50;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - loopHeight);
    ctx.lineTo(startX - loopWidth, startY - loopHeight);
    ctx.lineTo(startX - loopWidth, startY);
    ctx.moveTo(startX,startY);
	
	const arrowWidth = 5;
    const arrowHeight = 10;
	

    ctx.lineTo(startX-arrowWidth,startY-arrowHeight);
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX+arrowWidth,startY-arrowHeight);
  
    ctx.stroke();

    

    // Dibujar la multiplicidad cerca de la flecha
    ctx.font = '12px Arial';
    ctx.fillText(multiplicity, startX+7, startY -5);
}

function drawInheritanceArrow(toX, toY, fromX, fromY) {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
}

function drawFlecha(fromX, fromY, toX, toY) {
    const arrowWidth = 10;
    const arrowHeight = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();

    ctx.translate(toX, toY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowWidth, -arrowHeight / 4);
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowWidth, arrowHeight / 4);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

function drawCompositionDiamond(fromX, fromY, toX, toY) {
    const diamondWidth = 10;
    const diamondHeight = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.translate(fromX, fromY);
    ctx.rotate(angle - Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-diamondWidth / 2, diamondHeight / 2);
    ctx.lineTo(0, diamondHeight);
    ctx.lineTo(diamondWidth / 2, diamondHeight / 2);
    ctx.closePath();
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
}

function drawAgregationDiamond(fromX, fromY, toX, toY) {
    const diamondWidth = 10;
    const diamondHeight = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.translate(fromX, fromY);
    ctx.rotate(angle - Math.PI / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-diamondWidth / 2, diamondHeight / 2);
    ctx.lineTo(0, diamondHeight);
    ctx.lineTo(diamondWidth / 2, diamondHeight / 2);
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.restore();
}

function addClass() {
    const className = document.getElementById('classNameInput').value;
    const newClass = new UMLClass(className, 50, 50);
    classes.push(newClass);
    updateClassSelects();
    drawDiagram();
}

function addAttribute() {
    const className = document.getElementById('classNameInput').value;
    const attribute = document.getElementById('attributeInput').value;
    const visibility = document.getElementById('attributeVisibility').value;
    const type = document.getElementById('attributeType').value;
    const attr = `${visibility} ${attribute}:${type}`;

    const cls = classes.find(c => c.name === className);
    if (cls) {
        cls.addAttribute(attr);
        drawDiagram();
    }
}

function addMethod() {
    const className = document.getElementById('classNameInput').value;
    const method = document.getElementById('methodInput').value;
    const visibility = document.getElementById('methodVisibility').value;
    const type = document.getElementById('methodType').value;
    const meth = `${visibility} ${method}():${type}`;

    const cls = classes.find(c => c.name === className);
    if (cls) {
        cls.addMethod(meth);
        drawDiagram();
    }
}

function addRelation() {
    const fromClass = document.getElementById('fromClassSelect').value;
    const toClass = document.getElementById('toClassSelect').value;
    const type = document.getElementById('relationType').value;
    const fromMultiplicity = document.getElementById('multiplicityFrom').value || '1';
    const toMultiplicity = document.getElementById('multiplicityTo').value || '*';

    const fromCls = classes.find(c => c.name === fromClass);
    const toCls = classes.find(c => c.name === toClass);

    if (fromCls && toCls) {
        const newRelation = new Relation(fromCls, toCls, type, fromMultiplicity, toMultiplicity);
        relations.push(newRelation);
        drawDiagram();
    }
}

function updateClassSelects() {
    const fromClassSelect = document.getElementById('fromClassSelect');
    const toClassSelect = document.getElementById('toClassSelect');

    fromClassSelect.innerHTML = '';
    toClassSelect.innerHTML = '';

    classes.forEach(cls => {
        const optionFrom = document.createElement('option');
        optionFrom.value = cls.name;
        optionFrom.text = cls.name;
        fromClassSelect.add(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = cls.name;
        optionTo.text = cls.name;
        toClassSelect.add(optionTo);
    });
}

function drawDiagram() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    relations.forEach(relation => relation.draw());
    classes.forEach(cls => cls.draw());
}

function calculateLinePoints(fromClass, toClass, offset) {
    // Centro horizontal y vertical de la clase origen
    const fromXCenter = fromClass.x + fromClass.width / 2;
    const fromYCenter = fromClass.y + fromClass.height / 2;

    // Centro horizontal y vertical de la clase destino
    const toXCenter = toClass.x + toClass.width / 2;
    const toYCenter = toClass.y + toClass.height / 2;

    // Ancho y alto de la clase destino
    const toWidth = toClass.width;
    const toHeight = toClass.height;

    // Dirección de la línea desde el centro de la clase origen hacia el centro de la clase destino
    const dx = toXCenter - fromXCenter;
    const dy = toYCenter - fromYCenter;

    // Normalización de la dirección para obtener la unidad
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / length;
    const unitDy = dy / length;

    // Punto de origen de la relación (moviéndose desde el centro hacia el borde de la caja de la clase origen)
    const fromX = fromXCenter + unitDx * (fromClass.width / 2 + offset);
    const fromY = fromYCenter + unitDy * (fromClass.height / 2 + offset);

    // Calcular el punto de intersección con el borde de la clase destino
    let intersectionX, intersectionY;

    // Calcular las intersecciones con los bordes de la caja de la clase destino
    const cx = fromXCenter;
    const cy = fromYCenter;
    const cw = fromClass.width / 2 + offset;
    const ch = fromClass.height / 2 + offset;

    const tx = toXCenter;
    const ty = toYCenter;
    const tw = toWidth / 2;
    const th = toHeight / 2;

    // Se calcula la intersección con los cuatro bordes posibles de la caja de la clase destino
    let intersections = [];

    // Intersección con el borde izquierdo de la caja destino
    let intersection = intersectionWithLineSegment(cx, cy, tx, ty, toClass.x, toClass.y, toClass.x, toClass.y + toClass.height);
    if (intersection) intersections.push(intersection);

    // Intersección con el borde superior de la caja destino
    intersection = intersectionWithLineSegment(cx, cy, tx, ty, toClass.x, toClass.y, toClass.x + toClass.width, toClass.y);
    if (intersection) intersections.push(intersection);

    // Intersección con el borde derecho de la caja destino
    intersection = intersectionWithLineSegment(cx, cy, tx, ty, toClass.x + toClass.width, toClass.y, toClass.x + toClass.width, toClass.y + toClass.height);
    if (intersection) intersections.push(intersection);

    // Intersección con el borde inferior de la caja destino
    intersection = intersectionWithLineSegment(cx, cy, tx, ty, toClass.x, toClass.y + toClass.height, toClass.x + toClass.width, toClass.y + toClass.height);
    if (intersection) intersections.push(intersection);

    // Encontrar la intersección más cercana al centro de la clase destino
    let minDistance = Number.MAX_SAFE_INTEGER;
    intersections.forEach(inter => {
        const dist = distance(cx, cy, inter.x, inter.y);
        if (dist < minDistance) {
            minDistance = dist;
            intersectionX = inter.x;
            intersectionY = inter.y;
        }
    });

    // Si no se encontró ninguna intersección (esto debería ser imposible en condiciones normales)
    // se toma el centro de la clase destino como punto de llegada
    if (isNaN(intersectionX) || isNaN(intersectionY)) {
        intersectionX = toXCenter;
        intersectionY = toYCenter;
    }

    return { fromX, fromY, toX: intersectionX, toY: intersectionY };
}

function intersectionWithLineSegment(x1, y1, x2, y2, x3, y3, x4, y4) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        const intersectionX = x1 + ua * (x2 - x1);
        const intersectionY = y1 + ua * (y2 - y1);
        return { x: intersectionX, y: intersectionY };
    }
    return null;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}





canvas.addEventListener('mousedown', function(e) {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    selectedClass = classes.find(cls => mouseX > cls.x && mouseX < cls.x + cls.width && mouseY > cls.y && mouseY < cls.y + cls.height);

    if (selectedClass) {
        offsetX = mouseX - selectedClass.x;
        offsetY = mouseY - selectedClass.y;
    } else {
        const closeRelation = relations.find(relation => {
            const { fromX, fromY, toX, toY } = calculateLinePoints(relation.fromClass, relation.toClass, relation.offset);
            const distance = Math.abs((toY - fromY) * mouseX - (toX - fromX) * mouseY + toX * fromY - toY * fromX) / Math.sqrt(Math.pow(toY - fromY, 2) + Math.pow(toX - fromX, 2));
            return distance < 5;
        });

        if (closeRelation) {
            selectedRelation = closeRelation;
            draggingRelation = true;
            startDragX = mouseX;
            startDragY = mouseY;
        }
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (selectedClass) {
        selectedClass.x = e.offsetX - offsetX;
        selectedClass.y = e.offsetY - offsetY;
        drawDiagram();
    } else if (draggingRelation && selectedRelation) {
        const offsetX = e.offsetX - startDragX;
        const offsetY = e.offsetY - startDragY;
        selectedRelation.setOffset(selectedRelation.offset + offsetX);
        startDragX = e.offsetX;
        startDragY = e.offsetY;
        drawDiagram();
    }
});

canvas.addEventListener('mouseup', function(e) {
    selectedClass = null;
    if (draggingRelation) {
        draggingRelation = false;
        selectedRelation = null;
    }
});


function escapeXML(value) {
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function generateXMI() {
    let xmi = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmi += `  <XMI xmi.version="2.1" xmlns:xmi="http://schema.omg.org/spec/XMI/2.1" xmlns:uml="http://www.omg.org/spec/UML/20090901">\n`;
    xmi += `  <uml:Model xmi:type="uml:Model" name="UMLModel">\n`;

    classes.forEach(cls => {
        xmi += `    <packagedElement xmi:type="uml:Class" name="${cls.name}">\n`;
        cls.attributes.forEach(attr => {
            const [visibility, rest] = attr.split(' ');
            const [name, type] = rest.split(':');
            const escapedType = type ? escapeXML(type.trim()) : '';
            console.log(`Attribute - Name: ${name}, Type: ${escapedType}`);
            xmi += `      <ownedAttribute visibility="${visibility}" name="${name.trim()}" type="${escapedType}" />\n`;
        });
        cls.methods.forEach(meth => {
            const [visibility, rest] = meth.split(' ');
            const [name, returnType] = rest.split(':');
            const escapedReturnType = returnType ? escapeXML(returnType.trim()) : '';
            console.log(`Method - Name: ${name}, ReturnType: ${escapedReturnType}`);
            xmi += `      <ownedOperation visibility="${visibility}" name="${name.replace('()', '').trim()}" type="${escapedReturnType}" />\n`;
        });
        xmi += `    </packagedElement>\n`;
    });

    relations.forEach(rel => {
        let relationType = 'Association';
        if (rel.type === 'herencia') {
            relationType = 'Generalization';
        } else if (rel.type === 'composición') {
            relationType = 'Composition';
        } else if (rel.type === 'agregación') {
            relationType = 'Aggregation';
        } else if (rel.type === 'dependencia') {
            relationType = 'Dependency';
        } else if (rel.type === 'asociaciónDireccional') {
            relationType = 'DirectedAssociation';
        }

        xmi += `    <packagedElement xmi:type="uml:${relationType}" memberEnd="${rel.fromClass.name} ${rel.toClass.name}">\n`;
        if ((relationType !== 'Generalization') &&  (relationType !== 'Dependency')) {
            xmi += `      <ownedEnd type="${rel.fromClass.name}" multiplicity1="${rel.fromMultiplicity}" />\n`;
            xmi += `      <ownedEnd type="${rel.toClass.name}" multiplicity2="${rel.toMultiplicity}" />\n`;
        }
        xmi += `    </packagedElement>\n`;
    });

    xmi += `  </uml:Model>\n</XMI>`;
    return xmi;
}

function downloadXMI() {
    const xmi = generateXMI();
    const blob = new Blob([xmi], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.xmi';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
