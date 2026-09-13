const seedLeads = [
  {name:"Maria Santos",phone:"(201) 555-0181",service:"Water Heater",source:"Google Ads",status:"New",value:1900,date:"Sep 13"},
  {name:"David Chen",phone:"(973) 555-0142",service:"Drain & Sewer",source:"Organic Search",status:"Contacted",value:1250,date:"Sep 12"},
  {name:"Anthony Ruiz",phone:"(551) 555-0198",service:"Emergency Plumbing",source:"Referral",status:"Booked",value:780,date:"Sep 12"},
  {name:"Sarah Miller",phone:"(201) 555-0173",service:"Bathroom Remodel",source:"Facebook",status:"Quoted",value:6200,date:"Sep 11"},
  {name:"James Wilson",phone:"(862) 555-0114",service:"Leak Repair",source:"Direct",status:"New",value:490,date:"Sep 11"},
  {name:"Olivia Grant",phone:"(973) 555-0159",service:"Water Heater",source:"Google Ads",status:"Quoted",value:2400,date:"Sep 10"},
  {name:"Miguel Costa",phone:"(201) 555-0131",service:"Drain & Sewer",source:"Referral",status:"Contacted",value:970,date:"Sep 10"},
  {name:"Emily Brooks",phone:"(551) 555-0126",service:"Emergency Plumbing",source:"Google Ads",status:"Booked",value:860,date:"Sep 9"}
];

let leads = JSON.parse(localStorage.getItem("plumbflow_leads") || "null") || seedLeads;
let adminMode = false;

const customers = [
  ["Michael Foster","Water heater installed","$2,180 • Sep 9"],
  ["Rachel Kim","Sewer line inspection","$640 • Sep 8"],
  ["Brian Walker","Emergency leak repair","$895 • Sep 7"],
  ["Isabella Moore","Bathroom rough-in","$4,300 • Sep 5"],
  ["Carlos Mendes","Drain cleaning","$525 • Sep 4"],
  ["Jessica Patel","Fixture replacement","$760 • Sep 2"]
];

function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function statusClass(s){return s.toLowerCase().replace(/\s/g,"-")}
function money(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)}

function renderLeads(filter=""){
  const q=filter.toLowerCase();
  const list=leads.filter(x=>Object.values(x).join(" ").toLowerCase().includes(q));
  document.getElementById("leadTable").innerHTML=list.map(l=>`
    <tr><td><strong>${esc(l.name)}</strong><br><small>${esc(l.phone)}</small></td><td>${esc(l.service)}</td><td>${esc(l.source)}</td><td><span class="status ${statusClass(l.status)}">${esc(l.status)}</span></td><td>${money(l.value)}</td><td>${esc(l.date)}</td></tr>
  `).join("");
  document.getElementById("recentLeads").innerHTML=leads.slice(0,5).map(l=>`
    <div class="lead-row"><div><strong>${esc(l.name)}</strong><span>${esc(l.service)} • ${esc(l.source)}</span></div><small>${money(l.value)}</small><span class="status ${statusClass(l.status)}">${esc(l.status)}</span></div>
  `).join("");
  document.getElementById("statLeads").textContent=leads.length+16;
  document.getElementById("statPipeline").textContent=money(leads.filter(x=>x.status!=="Booked").reduce((a,b)=>a+b.value,0)+6800);
}

function renderCustomers(){
  document.getElementById("customerGrid").innerHTML=customers.map(c=>`<div class="customer-card"><strong>${c[0]}</strong><span>${c[1]}</span><span>${c[2]}</span></div>`).join("");
}

function renderKanban(){
  const stages=["New","Contacted","Quoted","Booked"];
  document.getElementById("kanban").innerHTML=stages.map(stage=>`
    <div class="kanban-col"><p class="eyebrow">${stage}</p><h3>${leads.filter(l=>l.status===stage).length} opportunities</h3>
      ${leads.filter(l=>l.status===stage).map(l=>`<div class="lead-card"><strong>${esc(l.name)}</strong><span>${esc(l.service)}</span><small>${money(l.value)} • ${esc(l.source)}</small></div>`).join("")}
    </div>`).join("");
}

function switchView(id){
  if(id==="admin" && !adminMode) return;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelector(`[data-view="${id}"]`)?.classList.add("active");
  document.getElementById("pageTitle").textContent=id.charAt(0).toUpperCase()+id.slice(1);
  if(id==="pipeline") renderKanban();
}

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>switchView(btn.dataset.view)));
document.querySelectorAll("[data-jump]").forEach(btn=>btn.addEventListener("click",()=>switchView(btn.dataset.jump)));

document.getElementById("roleToggle").addEventListener("click",()=>{
  adminMode=!adminMode;
  document.body.classList.toggle("admin-mode",adminMode);
  document.getElementById("roleBadge").textContent=adminMode?"Admin View":"Client View";
  document.getElementById("roleToggle").textContent=adminMode?"Switch to Client":"Switch to Admin";
  if(!adminMode && document.getElementById("admin").classList.contains("active")) switchView("dashboard");
});

const modal=document.getElementById("leadModal");
document.getElementById("addLeadBtn").addEventListener("click",()=>modal.showModal());
document.getElementById("saveLeadBtn").addEventListener("click",(e)=>{
  e.preventDefault();
  const name=document.getElementById("leadName").value.trim();
  const phone=document.getElementById("leadPhone").value.trim();
  if(!name||!phone) return;
  const d=new Date();
  leads.unshift({
    name, phone,
    service:document.getElementById("leadService").value,
    source:document.getElementById("leadSource").value,
    value:Number(document.getElementById("leadValue").value)||0,
    status:document.getElementById("leadStatus").value,
    date:d.toLocaleDateString("en-US",{month:"short",day:"numeric"})
  });
  localStorage.setItem("plumbflow_leads",JSON.stringify(leads));
  renderLeads(); renderKanban();
  document.getElementById("leadForm").reset(); modal.close();
});

document.getElementById("leadSearch").addEventListener("input",e=>renderLeads(e.target.value));

document.getElementById("exportBtn").addEventListener("click",()=>{
  const rows=[["Name","Phone","Service","Source","Status","Estimated Value","Created"],...leads.map(l=>[l.name,l.phone,l.service,l.source,l.status,l.value,l.date])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="plumbing-leads.csv"; a.click(); URL.revokeObjectURL(a.href);
});

new Chart(document.getElementById("leadChart"),{
  type:"line",
  data:{labels:["Apr","May","Jun","Jul","Aug","Sep"],datasets:[
    {label:"Leads",data:[62,71,69,83,95,124],borderColor:"#1368e8",backgroundColor:"rgba(19,104,232,.09)",fill:true,tension:.35},
    {label:"Booked",data:[26,32,31,39,44,52],borderColor:"#16a36a",backgroundColor:"transparent",tension:.35}
  ]},
  options:{responsive:true,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,grid:{color:"#edf1f5"}},x:{grid:{display:false}}}}
});

new Chart(document.getElementById("sourceChart"),{
  type:"doughnut",
  data:{labels:["Google Ads","Organic","Referral","Facebook","Direct"],datasets:[{data:[38,27,17,11,7],backgroundColor:["#1368e8","#22b8cf","#16a36a","#f59e0b","#8b5cf6"],borderWidth:0}]},
  options:{cutout:"67%",plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true}}}}
});

new Chart(document.getElementById("revenueChart"),{
  type:"bar",
  data:{labels:["Apr","May","Jun","Jul","Aug","Sep"],datasets:[{label:"Revenue",data:[28600,31900,30300,35700,39400,42780],backgroundColor:"#1368e8",borderRadius:8}]},
  options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>"$"+(v/1000)+"k"},grid:{color:"#edf1f5"}},x:{grid:{display:false}}}}
});

renderLeads(); renderCustomers(); renderKanban();

