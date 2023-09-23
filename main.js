const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')

var mouseDown = false
var updatedPositions = []
var enableDrawing = true

async function getScreen(){
    var { data, error } = await supabaseClient
        .from('boardData')
        .select()
    
    console.log(data[0].boardData)
    
    if(data[0].boardData == "clear"){
        ctx.clearRect(0,0,canvas.width,canvas.height)
    } else {
        data = JSON.parse(data[0].boardData)
        brushWidth = data[1]
        ctx.fillStyle = data[0]
        for(let i=2;i<data.length;i++){
            ctx.fillRect(data[i][0]-(brushWidth/2),data[i][1]-(brushWidth/2),brushWidth,brushWidth)
        }
    }
}

function changeMode(){
    if(document.getElementById('mode').value == "send"){
        document.getElementById('color').hidden = false
        document.getElementById('clearScreen').hidden = false
        document.getElementById('brushWidth').hidden = false
        enableDrawing = true
    }

    else{
        document.getElementById('color').hidden = true
        document.getElementById('clearScreen').hidden = true
        document.getElementById('brushWidth').hidden = true
        enableDrawing = false
        getScreen()
        supabaseClient
            .channel('any')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'boardData', filter: 'user_id=eq.1' }, payload => {
                if(payload.new.boardData == "clear"){
                    ctx.clearRect(0,0,canvas.width,canvas.height)
                } else {
                    payload = JSON.parse(payload.new.boardData)
                    brushWidth = payload[1]
                    ctx.fillStyle = payload[0]
                    for(let i=2;i<payload.length;i++){
                        ctx.fillRect(payload[i][0]-(brushWidth/2),payload[i][1]-(brushWidth/2),brushWidth,brushWidth)
                    }
                }
            })
            .subscribe()
    }
}

canvas.addEventListener('mousedown',function mouseDownEvent(e){
    if(enableDrawing){
        ctx.fillStyle = document.getElementById('color').value
        brushWidth = document.getElementById('brushWidth').value
        mouseDown = true
        updatedPositions = [ctx.fillStyle,brushWidth,[e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)]]
        ctx.fillRect(e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2),brushWidth,brushWidth)
    }
})

canvas.addEventListener('mousemove',function mouseMoveEvent(e){
    if(enableDrawing){
        if(mouseDown){
            updatedPositions.push([e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)])
            ctx.fillRect(e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2),brushWidth,brushWidth)
        }
    }
})

canvas.addEventListener('mouseup',async function mouseUpEvent(e){
    if(enableDrawing){
        mouseDown = false
        updatedPositions = Array.from(new Set(updatedPositions.map(JSON.stringify)), JSON.parse)
        console.log(updatedPositions)
        var {error} = await supabaseClient
            .from('boardData')
            .update({boardData: updatedPositions})
            .eq('user_id', 1)
        console.log(error)
    }
})

async function clearScreen(){
    console.log("clear")
    ctx.clearRect(0,0,canvas.width,canvas.height)

    var {error} = await supabaseClient
        .from('boardData')
        .update({boardData: "clear"})
        .eq('user_id', 1)
    
    console.log(error)
}

changeMode()