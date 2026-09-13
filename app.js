const seedLeads = [
  {name:"Maria Santos",phone:"(201) 555-0181",service:"Ceramic Coating",source:"Google Ads",status:"New",value:850,date:"Sep 13"},
  {name:"David Chen",phone:"(973) 555-0142",service:"Full Detail",source:"Organic Search",status:"Contacted",value:220,date:"Sep 12"},
  {name:"Anthony Ruiz",phone:"(551) 555-0198",service:"Paint Correction",source:"Referral",status:"Booked",value:480,date:"Sep 12"},
  {name:"Sarah Miller",phone:"(201) 555-0173",service:"Interior Detailing",source:"Instagram",status:"Quoted",value:190,date:"Sep 11"},
  {name:"James Wilson",phone:"(862) 555-0114",service:"Exterior Wash",source:"Direct",status:"New",value:65,date:"Sep 11"},
  {name:"Olivia Grant",phone:"(973) 555-0159",service:"Ceramic Coating",source:"Google Ads",status:"Quoted",value:900,date:"Sep 10"},
  {name:"Miguel Costa",phone:"(201) 555-0131",service:"Full Detail",source:"Referral",status:"Contacted",value:230,date:"Sep 10"},
  {name:"Emily Brooks",phone:"(551) 555-0126",service:"Engine Bay Cleaning",source:"Google Ads",status:"Booked",value:110,date:"Sep 9"}
];

let leads = JSON.parse(localStorage.getItem("picabros_leads") || "null") || seedLeads;
let adminMode = false;

const customers = [
  ["Michael Foster","Ceramic coating applied","$920 • Sep 9"],
  ["Rachel Kim","Full interior + exterior detail","$240 • Sep 8"],
  ["Brian Walker","Paint correction, 2-stage","$510 • Sep 7"],
  ["Isabella Moore","Fleet wash, 6 vehicles","$390 • Sep 5"],
  ["Carlos Mendes","Engine bay cleaning","$95 • Sep 4"],
  ["Jessica Patel","Exterior wash + wax","$85 • Sep 2"]
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
  document.getElementById("statLeads").textContent=leads.length+34;
  document.getElementById("statPipeline").textContent=money(leads.filter(x=>x.status!=="Booked").reduce((a,b)=>a+b.value,0)+2600);
  document.getElementById("statBooked").textContent=leads.filter(x=>x.status==="Booked").length+9;
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
  localStorage.setItem("picabros_leads",JSON.stringify(leads));
  renderLeads(); renderKanban();
  document.getElementById("leadForm").reset(); modal.close();
});

document.getElementById("leadSearch").addEventListener("input",e=>renderLeads(e.target.value));

document.getElementById("exportBtn").addEventListener("click",()=>{
  const rows=[["Name","Phone","Service","Source","Status","Estimated Value","Created"],...leads.map(l=>[l.name,l.phone,l.service,l.source,l.status,l.value,l.date])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="picabros-leads.csv"; a.click(); URL.revokeObjectURL(a.href);
});

new Chart(document.getElementById("leadChart"),{
  type:"line",
  data:{labels:["Apr","May","Jun","Jul","Aug","Sep"],datasets:[
    {label:"Leads",data:[48,55,60,74,88,110],borderColor:"#d9272e",backgroundColor:"rgba(217,39,46,.09)",fill:true,tension:.35},
    {label:"Booked",data:[19,24,27,33,40,49],borderColor:"#16a36a",backgroundColor:"transparent",tension:.35}
  ]},
  options:{responsive:true,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,grid:{color:"#edf1f5"}},x:{grid:{display:false}}}}
});

new Chart(document.getElementById("sourceChart"),{
  type:"doughnut",
  data:{labels:["Google Ads","Organic","Referral","Instagram","Direct"],datasets:[{data:[34,22,20,17,7],backgroundColor:["#d9272e","#c99a3c","#16a36a","#8b5cf6","#4a4f5b"],borderWidth:0}]},
  options:{cutout:"67%",plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:true}}}}
});

new Chart(document.getElementById("revenueChart"),{
  type:"bar",
  data:{labels:["Apr","May","Jun","Jul","Aug","Sep"],datasets:[{label:"Revenue",data:[9600,10900,10300,12700,14400,15920],backgroundColor:"#d9272e",borderRadius:8}]},
  options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>"$"+(v/1000)+"k"},grid:{color:"#edf1f5"}},x:{grid:{display:false}}}}
});

renderLeads(); renderCustomers(); renderKanban();
