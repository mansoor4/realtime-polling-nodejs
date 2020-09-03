const _id=document.getElementById("id").value;
const submit=document.getElementById("submit");
const radio=document.querySelectorAll("input[type=radio]");


// socket
var socket = io();


// on connection
socket.on('connect',()=>{
    console.log('server connected');
    socket.emit('join',{
        room:_id
    })
})


socket.on('voteCount',(data)=>{
	console.log(data);
	let dataPoints = [];
	data.choice.forEach(choice=>
		{
			dataPoints.push(
				{
				label:choice.opt,
				y:choice.vote
				});
		})
	console.log(dataPoints);
		    const chartContainer = document.querySelector("#chartContainer");
		
		    if (chartContainer) {
		      const chart = new CanvasJS.Chart("chartContainer", {
		        animationEnabled: false,
		        theme: "theme1",
		        title: {
		          text: `Total Votes `,
		        },
		        data: [
		          {
		            type: "column",
		            dataPoints: dataPoints,
		          },
		        ],
		      });
			  chart.render();
}
})


//Fetch
submit.addEventListener("click",function(e)
{
	var value;
   e.preventDefault();
   radio.forEach(radio=>
	{
		if(radio.checked)
		{
			value=radio.value;
		}
	})
	if(value!==undefined)
	{
		fetch(`/poll/${_id}`,
		{
			method:"post",
			body:JSON.stringify(
				{
					option:value,
					_id:_id
				}),
			headers: new Headers(
				{
					 "Content-Type": "application/json",
				}),
		})
		.then(res=>
			{
				// console.log(res)
			})
		.catch(err=>
			{
				// console.log(err);
			})	
	}

})
