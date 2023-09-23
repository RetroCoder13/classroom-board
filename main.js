const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')

var mouseDown = false
var updatedPositions = []
var enableDrawing = true
var prevPosition = []
var brushMode = "brush"

if(!localStorage['sb-dkffidtdquvdbslkvqux-auth-token']){
    location.href = "./login"
}

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
    if(JSON.parse(localStorage['sb-dkffidtdquvdbslkvqux-auth-token']).user.email == "atk@gbhs.co.uk"){
        document.getElementById('color').hidden = false
        document.getElementById('clearScreen').hidden = false
        document.getElementById('brushWidth').hidden = false
        document.getElementById('brushMode').hidden = false
        enableDrawing = true
    }

    else{
        document.getElementById('color').hidden = true
        document.getElementById('clearScreen').hidden = true
        document.getElementById('brushWidth').hidden = true
        document.getElementById('brushMode').hidden = true
        enableDrawing = false
        getScreen()
        supabaseClient
            .channel('any')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'boardData', filter: 'user_id=eq.1' }, payload => {
                if(payload.new.boardData == "clear"){
                    ctx.clearRect(0,0,canvas.width,canvas.height)
                } else {
                    payload = JSON.parse(payload.new.boardData)
                    prevPosition = [payload[3][0],payload[3][1]]
                    brushWidth = payload[1]
                    brushMode = payload[2]
                    ctx.fillStyle = payload[0]
                    for(let i=4;i<payload.length;i++){
                        let x = payload[i][0] - prevPosition[0]
                        let y = payload[i][1] - prevPosition[1]
                        if(x > 0){
                            for(let i=0;i<x;i++){
                                if(brushMode == "brush"){
                                    ctx.fillRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                                } else if(brushMode == "erase"){
                                    ctx.clearRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                                }
                            }
                        } else if(x < 0) {
                            for(let i=0;i>x;i--){
                                if(brushMode == "brush"){
                                    ctx.fillRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                                } else if(brushMode == "erase"){
                                    ctx.clearRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                                }
                            }
                        } else if(y > 0) {
                            for(let i=0;i<y;i++){
                                if(brushMode == "brush"){
                                    ctx.fillRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                                } else if(brushMode == "erase"){
                                    ctx.clearRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                                }
                            }
                        } else if(y < 0) {
                            for(let i=0;i>y;i--){
                                if(brushMode == "brush"){
                                    ctx.fillRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                                } else if(brushMode == "erase"){
                                    ctx.clearRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                                }
                            }
                        }

                        prevPosition = [payload[i][0],payload[i][1]]
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
        updatedPositions = [ctx.fillStyle,brushWidth,brushMode,[e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)]]
        if(brushMode == "brush"){
            ctx.fillRect(e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2),brushWidth,brushWidth)
        } else if(brushMode == "erase"){
            ctx.clearRect(e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2),brushWidth,brushWidth)
        }
        prevPosition = [e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)]
    }
})

canvas.addEventListener('mousemove',function mouseMoveEvent(e){
    if(enableDrawing){
        if(mouseDown){
            updatedPositions.push([e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)])
            
            let x = e.offsetX-(brushWidth/2) - prevPosition[0]
            let y = e.offsetY-(brushWidth/2) - prevPosition[1]
            if(x > 0){
                for(let i=0;i<x;i++){
                    if(brushMode == "brush"){
                        ctx.fillRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                    } else if(brushMode == "erase"){
                        ctx.clearRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                    }
                }
            } else if(x < 0) {
                for(let i=0;i>x;i--){
                    if(brushMode == "brush"){
                        ctx.fillRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                    } else if(brushMode == "erase"){
                        ctx.clearRect(prevPosition[0]+i,prevPosition[1]+(i*(y/x)),brushWidth,brushWidth)
                    }
                }
            } else if(y > 0) {
                for(let i=0;i<y;i++){
                    if(brushMode == "brush"){
                        ctx.fillRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                    } else if(brushMode == "erase"){
                        ctx.clearRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                    }
                }
            } else if(y < 0) {
                for(let i=0;i>y;i--){
                    if(brushMode == "brush"){
                        ctx.fillRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                    } else if(brushMode == "erase"){
                        ctx.clearRect(prevPosition[0],prevPosition[1]+i,brushWidth,brushWidth)
                    }
                }
            }

            prevPosition = [e.offsetX-(brushWidth/2),e.offsetY-(brushWidth/2)]
        }
    }
})

canvas.addEventListener('mouseup',async function mouseUpEvent(e){
    if(enableDrawing){
        mouseDown = false
        updatedPositions = Array.from(new Set(updatedPositions.map(JSON.stringify)), JSON.parse)
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