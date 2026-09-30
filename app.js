// ======================================
// 90 ДНЕЙ
// ОСНОВНАЯ ЛОГИКА
// ======================================


const CHALLENGE_START = "2026-10-01";

const CHALLENGE_LENGTH = 90;



// ======================================
// ДАННЫЕ
// ======================================


let tasks =
JSON.parse(
localStorage.getItem("90days_tasks")
)
|| [];



let beforeAfter =
JSON.parse(
localStorage.getItem("90days_before_after")
)
||
{

pointA:{
goal:"",
why:"",
state:"",
proud:"",
future:""
},


wheel:[

{
name:"Здоровье",
value:5
},

{
name:"Финансы",
value:5
},

{
name:"Блог",
value:5
},

{
name:"Развитие",
value:5
}

]

};




// ======================================
// СОХРАНЕНИЕ
// ======================================


function saveTasks(){

localStorage.setItem(
"90days_tasks",
JSON.stringify(tasks)
);

}



function saveBeforeAfter(){

localStorage.setItem(
"90days_before_after",
JSON.stringify(beforeAfter)
);

}




// ======================================
// ДАТЫ
// ======================================


function today(){

let d =
new Date();


return d.toISOString()
.slice(0,10);

}



function formatDate(date){

return new Date(date)
.toLocaleDateString(
"ru-RU",
{
day:"numeric",
month:"long"
}
);

}





function challengeDay(){

let start =
new Date(CHALLENGE_START);


let now =
new Date(today());


return Math.floor(
(now-start)
/
(1000*60*60*24)
)
+1;

}




// ======================================
// ЗАПУСК
// ======================================


document.addEventListener(
"DOMContentLoaded",
()=>{


updateHeader();

renderTasks();

setupNavigation();

setupBeforeAfter();


}
);
// ======================================
// ЭКРАН СЕГОДНЯ
// ======================================


function updateHeader(){


const day =
document.querySelector("#challenge-day");


if(day){

let number =
challengeDay();


day.textContent =
number > 0
?
`День ${number}`
:
"Старт 1 октября";

}



const date =
document.querySelector("#today-date");


if(date){

date.textContent =
formatDate(today());

}


}




// ======================================
// ПОЛУЧИТЬ ЗАДАЧИ НА ДЕНЬ
// ======================================


function getTasksForDate(date){


return tasks.filter(
task=>{


if(task.repeat==="daily"){

return date >= task.start;

}


return task.date===date;


}

);


}




// ======================================
// ОТРИСОВКА ЗАДАЧ
// ======================================


function renderTasks(){


const container =
document.querySelector("#task-groups");



if(!container)
return;



container.innerHTML="";



let list =
getTasksForDate(today());



if(list.length===0){


container.innerHTML=
`
<div class="ba-card">

<p>
Сегодня пока нет задач 🌸
</p>


</div>
`;



createAddButton(container);


return;


}




list.forEach(task=>{


let item =
document.createElement("div");


item.className=
"task-item";



if(task.done){

item.classList.add(
"completed"
);

}



item.innerHTML=
`

<button
class="task-check">

</button>


<div class="task-content">

<div class="task-title">

${task.title}

</div>

</div>


<div class="task-actions">

<button
class="delete-task">
×
</button>

</div>

`;





item.querySelector(
".task-check"
)
.onclick=
()=>{


task.done=
!task.done;


saveTasks();


renderTasks();


renderCalendar();


};





item.querySelector(
".delete-task"
)
.onclick=
()=>{


tasks=
tasks.filter(
t=>t.id!==task.id
);


saveTasks();


renderTasks();


renderCalendar();



};



container.appendChild(item);



});



createAddButton(container);


}




// ======================================
// КНОПКА ДОБАВИТЬ
// ======================================


function createAddButton(container){


let button =
document.createElement("button");


button.className=
"add-task-button";


button.textContent=
"+ Добавить задачу";



button.onclick=
()=>{


let title =
prompt(
"Что нужно сделать?"
);



if(!title)
return;



tasks.push({

id:
Date.now(),


title:title,


date:
today(),


start:
today(),


done:false

});



saveTasks();


renderTasks();


renderCalendar();


};



container.appendChild(button);



}
// ======================================
// КАЛЕНДАРЬ
// ======================================


let calendarDate =
new Date(CHALLENGE_START);



function renderCalendar(){


const calendar =
document.querySelector(
"#challenge-calendar"
);



if(!calendar)
return;



calendar.innerHTML="";



let year =
calendarDate.getFullYear();



let month =
calendarDate.getMonth();




let header =
document.createElement("div");


header.className=
"calendar-month";



header.innerHTML=
`

<button
id="prev-month"
class="calendar-arrow">
‹
</button>


<h2>
${
calendarDate.toLocaleDateString(
"ru-RU",
{
month:"long",
year:"numeric"
}
)
}
</h2>


<button
id="next-month"
class="calendar-arrow">
›
</button>

`;



calendar.appendChild(header);





header.querySelector(
"#prev-month"
)
.onclick=
()=>{


calendarDate =
new Date(
year,
month-1,
1
);


renderCalendar();


};




header.querySelector(
"#next-month"
)
.onclick=
()=>{


calendarDate =
new Date(
year,
month+1,
1
);


renderCalendar();


};





let grid =
document.createElement("div");


grid.className=
"calendar-grid";





[
"Пн",
"Вт",
"Ср",
"Чт",
"Пт",
"Сб",
"Вс"

].forEach(day=>{


let el =
document.createElement("div");


el.className=
"calendar-weekday";


el.textContent=
day;


grid.appendChild(el);


});






let first =
new Date(
year,
month,
1
);



let start =
first.getDay();



if(start===0)
start=7;




for(
let i=1;
i<start;
i++
){

let empty =
document.createElement("div");

empty.className=
"calendar-day empty";


grid.appendChild(empty);


}







let days =
new Date(
year,
month+1,
0
)
.getDate();





for(
let d=1;
d<=days;
d++
){



let date =
`${year}-${String(month+1)
.padStart(2,"0")}-${String(d)
.padStart(2,"0")}`;





let day =
document.createElement("button");


day.className=
"calendar-day";



day.innerHTML=
`

<span>
${d}
</span>

`;





let dayTasks =
getTasksForDate(date);





if(dayTasks.length){


let completed =
dayTasks.filter(
t=>t.done
)
.length;



let info =
document.createElement("small");


info.textContent=
`${completed}/${dayTasks.length}`;


day.appendChild(info);




if(
completed===dayTasks.length
){

day.classList.add(
"status-complete"
);


}
else
{

day.classList.add(
"status-partial"
);


}


}





if(date===today()){

day.classList.add(
"today"
);


}





grid.appendChild(day);



}




calendar.appendChild(grid);



}




// ======================================
// ТОЧКА А → ТОЧКА Б
// ======================================


function setupBeforeAfter(){


const page =
document.querySelector(
"#before-after-page"
);



if(!page)
return;



renderBeforeAfter();


}





function renderBeforeAfter(){


const page =
document.querySelector(
"#before-after-page"
);



if(!page)
return;




page.innerHTML=
`

<div class="ba-card">


<p class="eyebrow">
МОЯ ТОЧКА А
</p>


<h2>
С чего я начинаю
</h2>



<label>
Что я хочу изменить за 90 дней?
<textarea id="ba-goal"></textarea>
</label>



<label>
Почему это важно для меня?
<textarea id="ba-why"></textarea>
</label>



<label>
Как я чувствую себя сейчас?
<textarea id="ba-state"></textarea>
</label>



<label>
Чем я уже могу гордиться?
<textarea id="ba-proud"></textarea>
</label>



<label>
Какой я хочу увидеть себя через 90 дней?
<textarea id="ba-future"></textarea>
</label>



<button
class="primary-button"
id="save-point-a">

Сохранить точку А

</button>



</div>





<div class="ba-card">


<p class="eyebrow">
КОЛЕСО БАЛАНСА
</p>


<h2>
Мои сферы жизни
</h2>



<div id="wheel">

</div>



</div>

`;




document.querySelector(
"#ba-goal"
).value =
beforeAfter.pointA.goal || "";



document.querySelector(
"#ba-why"
).value =
beforeAfter.pointA.why || "";



document.querySelector(
"#ba-state"
).value =
beforeAfter.pointA.state || "";



document.querySelector(
"#ba-proud"
).value =
beforeAfter.pointA.proud || "";



document.querySelector(
"#ba-future"
).value =
beforeAfter.pointA.future || "";






document.querySelector(
"#save-point-a"
)
.onclick=
()=>{


beforeAfter.pointA.goal =
document.querySelector("#ba-goal").value;


beforeAfter.pointA.why =
document.querySelector("#ba-why").value;


beforeAfter.pointA.state =
document.querySelector("#ba-state").value;


beforeAfter.pointA.proud =
document.querySelector("#ba-proud").value;


beforeAfter.pointA.future =
document.querySelector("#ba-future").value;



saveBeforeAfter();



alert(
"Точка А сохранена ❤️"
);


};




renderWheel();



}






// ======================================
// КОЛЕСО БАЛАНСА
// ======================================



function renderWheel(){


const container =
document.querySelector("#wheel");



if(!container)
return;



container.innerHTML="";



beforeAfter.wheel.forEach(
(sphere,index)=>{


let block =
document.createElement("div");


block.className=
"wheel-item";



block.innerHTML=
`

<div>

${sphere.name}

</div>



<input
type="range"
min="1"
max="10"
value="${sphere.value}"
data-index="${index}"
>



<span>
${sphere.value}/10
</span>


`;




block.querySelector(
"input"
)
.oninput=
(e)=>{


sphere.value =
Number(
e.target.value
);


block.querySelector(
"span"
)
.textContent=
sphere.value+"/10";


saveBeforeAfter();



};




container.appendChild(block);



}
);


}
// ======================================
// НАВИГАЦИЯ И ЗАПУСК ПРИЛОЖЕНИЯ
// ======================================



function setupNavigation(){


const buttons =
document.querySelectorAll(
".nav-item"
);



buttons.forEach(
button=>{


button.addEventListener(
"click",
()=>{


const page =
button.dataset.page;



if(!page)
return;



showPage(page);



buttons.forEach(
item=>
item.classList.remove(
"active"
)
);



button.classList.add(
"active"
);



refreshPage(page);



}
);



});



}





function showPage(pageId){


document
.querySelectorAll(
".page"
)
.forEach(
page=>{


page.classList.remove(
"active-page"
);


}
);




const page =
document.getElementById(
pageId
);



if(page){

page.classList.add(
"active-page"
);

}


}






function refreshPage(page){



if(
page==="today-page"
){

renderTasks();

updateChallengeInfo();

}



if(
page==="calendar-page"
){

renderCalendar();

}



if(
page==="before-after-page"
){

renderBeforeAfter();

}



}






// ======================================
// ЗАПУСК
// ======================================


document.addEventListener(
"DOMContentLoaded",
()=>{


setupNavigation();



renderTasks();



renderCalendar();



setupBeforeAfter();





const first =
document.querySelector(
".nav-item"
);



if(first){

first.classList.add(
"active"
);

}




const todayPage =
document.querySelector(
"#today-page"
);



if(todayPage){

todayPage.classList.add(
"active-page"
);

}



}
);





// ======================================
// СОХРАНЕНИЕ ТОЧКИ А
// ======================================


let beforeAfter =
JSON.parse(
localStorage.getItem(
"90days_before_after"
)
)
||
{


pointA:{


goal:"",
why:"",
state:"",
proud:"",
future:""

},



wheel:[


{
name:"Здоровье",
value:5
},


{
name:"Финансы",
value:5
},


{
name:"Блог",
value:5
},


{
name:"Развитие",
value:5
}


]


};






function saveBeforeAfter(){


localStorage.setItem(

"90days_before_after",

JSON.stringify(
beforeAfter
)

);


}
