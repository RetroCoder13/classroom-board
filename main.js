const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')

var mouseDown = false
var updatedPositions = []
var enableDrawing = true

window.onload = async function(){
    var { data, error } = await supabaseClient
        .from('boardData')
        .select()
    
    console.log(data)
}

function changeMode(){
    if(document.getElementById('mode').value == "send"){
        document.getElementById('color').hidden = false
        enableDrawing = true
    }

    else{
        document.getElementById('color').hidden = true
        enableDrawing = false
        supabaseClient
            .channel('any')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'boardData', filter: 'user_id=eq.1' }, payload => {
                if(payload.new.boardData == "clear"){
                    ctx.clearRect(0,0,canvas.width,canvas.height)
                } else {
                    payload = JSON.parse(payload.new.boardData)
                    ctx.fillStyle = payload[0]
                    for(let i=1;i<payload.length;i++){
                        ctx.fillRect(payload[i][0],payload[i][1],10,10)
                    }
                }
            })
            .subscribe()
    }
}

canvas.addEventListener('mousedown',function mouseDownEvent(e){
    if(enableDrawing){
        ctx.fillStyle = document.getElementById('color').value
        mouseDown = true
        updatedPositions = [ctx.fillStyle,[e.offsetX,e.offsetY]]
        ctx.fillRect(e.offsetX,e.offsetY,10,10)
    }
})

canvas.addEventListener('mousemove',function mouseMoveEvent(e){
    if(enableDrawing){
        updatedPositions.push([e.offsetX,e.offsetY])
        if(mouseDown){
            ctx.fillRect(e.offsetX,e.offsetY,10,10)
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