const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')

var mouseDown = false
var updatedPositions = []
var enableDrawing = true
var prevPosition = []
var brushMode = "brush"
var updates = 2

if(!localStorage['sb-dkffidtdquvdbslkvqux-auth-token']){
    location.href = "./login"
}

async function getScreen(){
    var { data, error } = await supabaseClient
        .from('boardData')
        .select()
        .order('user_id', {ascending: true})

    for(let i=0;i<data.length;i++){
        if(data[i].boardData == "clear"){
            ctx.clearRect(0,0,canvas.width,canvas.height)
        } else {
            newData = JSON.parse(data[i].boardData)
            brushWidth = parseInt(newData[1])
            brushMode = newData[2]
            ctx.fillStyle = newData[0]
            prevPosition = newData[3]
            for(let i=4;i<newData.length;i++){
                let x = newData[i][0] - prevPosition[0]
                let y = newData[i][1] - prevPosition[1]
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

                prevPosition = [newData[i][0],newData[i][1]]
            }
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'boardData' }, payload => {
                if(payload.new.boardData == "clear"){
                    ctx.clearRect(0,0,canvas.width,canvas.height)
                } else if(payload.new.boardData == "save"){
                    downloadImage()
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
            .insert({user_id: updates, boardData: updatedPositions})
        updates += 1
    }
})

async function clearScreen(){
    ctx.clearRect(0,0,canvas.width,canvas.height)

    for(let i=1;i<updates;i++){
        if(i==1){
            var {error} = await supabaseClient
                .from('boardData')
                .update({boardData: "clear"})
                .eq('user_id', 1)
        } else {
            var {error} = await supabaseClient
                .from('boardData')
                .delete()
                .eq('user_id', i)
        }
    }
    updates = 2
}

async function save(){
    if(JSON.parse(localStorage['sb-dkffidtdquvdbslkvqux-auth-token']).user.email == "atk@gbhs.co.uk"){
        var {error} = await supabaseClient
            .from('boardData')
            .update({boardData: "save"})
            .eq('user_id', 1)
    }
    downloadImage()
}

async function downloadImage(){
    // let image = document.createElement('img')
    // image.src = canvas.toDataURL('image/png')
    // var { data, error } = await supabaseClient.storage.from('uploads').upload('image.png', canvas.toDataURL('image/png'), {contentType: 'image/png'})

    let link = document.createElement('a')
    link.download = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}.png`
    link.href = canvas.toDataURL()
    link.click()
}

changeMode()