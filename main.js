const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')

var mouseDown = false

window.onload = async function(){
    var { data, error } = await supabaseClient
        .from('boardData')
        .select()
    
    console.log(data)
}

function changeMode(){
    if(document.getElementById('mode').value == "send"){
        document.addEventListener('mousedown',function(e){
            mouseDown = true
            ctx.fillRect(e.offsetX,e.offsetY,10,10)
        })

        document.addEventListener('mousemove',function(e){
            if(mouseDown){
                ctx.fillRect(e.offsetX,e.offsetY,10,10)
            }
        })

        document.addEventListener('mouseup',async function(e){
            mouseDown = false
            imageData = ctx.getImageData(0,0,canvas.width,canvas.height).data
            finalImageData = {}
            for(let i=0;i<imageData.length/4;i++){
                if(imageData[4*i] != 0 || imageData[4*i+1] != 0 || imageData[4*i+2] != 0 || imageData[4*i+3] != 0){
                    finalImageData[i] = [imageData[4*i],imageData[4*i+1],imageData[4*i+2],imageData[4*i+3]]
                }
            }
            var {error} = await supabaseClient
                .from('boardData')
                .update({boardData: JSON.stringify(finalImageData)})
                .eq('user_id', 1)
        })
    }

    else{
        supabaseClient
            .channel('any')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'boardData', filter: 'user_id=eq.1' }, payload => {
                payload = JSON.parse(payload.new.boardData)
                console.log(payload)
                imageData = ctx.createImageData(canvas.width,canvas.height)
                console.log(parseInt(Object.keys(payload)[0]), payload[parseInt(Object.keys(payload)[0])])
                for(let i=0;i<Object.keys(payload).length;i++){
                    imageData[parseInt(Object.keys(payload)[i])] = payload[parseInt(Object.keys(payload)[i])]
                }
                console.log(imageData)
                ctx.putImageData(imageData,0,0)
            })
            .subscribe()
    }
}

changeMode()