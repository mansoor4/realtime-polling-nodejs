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
	socket.on('chart',(data)=>{
		console.log("onload");
		chart(data)
	})
})





socket.on('voteCount',(data)=>{
	console.log(data);
	chart(data)
})

// chart
function chart(data){
	let dataPoints = [];
	data.choice.forEach(choice=>
		{
			dataPoints.push(
				{
				label:choice.opt,
				y:choice.vote
				});
		})
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
}
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
		fetch(`http://localhost:3000/poll/${_id}`,
		{
			method:"POST",
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
		.then(()=>{
			document.querySelector("#submit").disabled = true;
		})
		.catch((err)=>
			{
				console.log(err);
			})	
	}
	

})
