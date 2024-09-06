"use strict";(self.webpackChunkfooter=self.webpackChunkfooter||[]).push([[127],{5127:(e,r,t)=>{t.r(r),t.d(r,{default:()=>o});var s=t(6213),a=t(5043),l=t(3986),d=t(579);function o(e){var r;const[t,o]=(0,a.useState)([]),[n,i]=(0,a.useState)(""),[c,u]=(0,a.useState)(""),[m,x]=(0,a.useState)(""),[h,p]=(0,a.useState)([]),[g,b]=(0,a.useState)([]),[f,v]=(0,a.useState)(""),[j,N]=(0,a.useState)({}),[w,S]=(0,a.useState)([]),[y,k]=(0,a.useState)(""),[C,E]=(0,a.useState)([]),[q,A]=(0,a.useState)(""),L="https://bwithf.onrender.com";(0,a.useEffect)((()=>{(async()=>{try{const e={authtoken:localStorage.getItem("token")},r=await s.A.get(`${L}/api/product/productnames`,{headers:e});S(r.data)}catch(e){console.error("Error fetching products:",e)}})()}),[]),(0,a.useEffect)((()=>{E(y?w.productNames.filter((e=>e.toLowerCase().includes(y.toLowerCase()))):[])}),[y,w]);const D=()=>{m.trim()&&(b([...g,m.trim()]),k(""))},P=e=>{(async e=>{try{let r=localStorage.getItem("token");const t=await s.A.get(`${L}/api/product/fetchsingleproduct/${e}`,{method:"GET",headers:{authtoken:r}});console.log(t.data.othername1),k(t.data.othername1.name),o((e=>e.includes(t.data.othername1._id)?e:[...e,t.data.othername1._id]))}catch(r){console.error("Error fetching products:",r)}})(e),E([])},[$,F]=(0,a.useState)(!1),I=()=>{F(!0)};return(0,d.jsx)(d.Fragment,{children:(0,d.jsxs)("div",{className:"",children:[(0,d.jsx)("div",{className:"App",children:(0,d.jsx)(l.A,{show:$,onClose:()=>{F(!1)},message:q})}),(0,d.jsxs)("div",{className:"mt-4 lg:w-full",children:[(0,d.jsxs)("div",{className:"text-[12px] ml-2 text-red-600",children:[null===n||void 0===n?void 0:n.message," ",null===n||void 0===n||null===(r=n.data)||void 0===r?void 0:r.name]}),(0,d.jsxs)("div",{className:"bg-[#f2f2f2] grid md:grid-cols-2 text-black px-2 gap-6 md:gap-12 items-center",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("input",{type:"text",onChange:e=>{const r=e.target.value;w.productNames.some((e=>e.toLowerCase().includes(r.toLowerCase())))&&k(r)},onKeyPress:e=>{"Enter"===e.key&&(e.preventDefault(),(()=>{if(y.trim()){if(!w.productNames.some((e=>e.toLowerCase()===y.toLowerCase().trim())))return;p([...h,y.trim()]),k(""),u("")}})())},value:y,name:"productname",placeholder:"Product",className:"px-3 py-1 border-black border-[2px] rounded-md w-[100%] "+(j.serialNumbers?"border-red-500":"")}),j.serialNumbers&&(0,d.jsx)("p",{className:"text-red-500 text-xs",children:j.serialNumbers}),C&&(0,d.jsx)("div",{className:"absolute bg-gray-300 px-3 rounded-md",children:(0,d.jsx)("div",{className:"suggestions",children:C.map(((e,r)=>(0,d.jsx)("div",{className:"suggestion cursor-pointer",onClick:()=>P(e),children:e},r)))})})]}),(0,d.jsxs)("div",{className:"grid md:grid-cols-1 text-black px-2 gap-2 md:gap-3 items-center",children:[(0,d.jsxs)("select",{name:"Serialrequired",onChange:e=>{v(e.target.value)},value:f,className:"px-3 py-1 border-black border-[2px] rounded-md "+(j.Serialrequired?"border-red-500":""),children:[(0,d.jsx)("option",{value:"",children:"Select Serial Requirement"}),[{value:"YES",label:"YES"},{value:"NO",label:"NO"}].map((e=>(0,d.jsx)("option",{value:e.value,children:e.label},e.value)))]}),j.Serialrequired&&(0,d.jsx)("p",{className:"text-red-500 text-xs",children:j.Serialrequired})]})]}),(0,d.jsxs)("div",{className:"mt-2",children:[(0,d.jsxs)("div",{className:"flex",children:[(0,d.jsx)("input",{type:"text",onChange:e=>{x(e.target.value)},onKeyPress:e=>{"Enter"===e.key&&(e.preventDefault(),D())},value:m,name:"serialNumbers",placeholder:"Enter other name",className:"px-3 py-1 w-[100%] border-black border-[2px] rounded-md "+(j.serialNumbers1?"border-red-500":"")}),(0,d.jsx)("button",{type:"button",className:"w-[100px]",onClick:D,children:"Add Name"})]}),j.serialNumbers1&&(0,d.jsx)("p",{className:"text-red-500 text-xs",children:j.serialNumbers1}),g.length>0&&(0,d.jsxs)("div",{className:"mt-4",children:[(0,d.jsx)("h2",{className:"font-bold",children:"other name"}),(0,d.jsx)("ul",{className:"grid gap-2 w-[50%] mt-2",children:g.map(((e,r)=>(0,d.jsxs)("li",{className:"flex gap-2 border-gray-400 border-[1px] rounded-md px-2 items-center justify-between",children:[e,(0,d.jsx)("button",{onClick:()=>{return r=e,void b(g.filter((e=>e!==r)));var r},className:"text-red-500",children:"x"})]},r)))})]})]}),h.length>0&&(0,d.jsxs)("div",{children:[(0,d.jsx)("h2",{children:"Products"}),(0,d.jsx)("ul",{className:"grid grid-cols-4 gap-2 w-[50%]",children:h.map(((e,r)=>(0,d.jsxs)("li",{className:"flex gap-2 border-gray-400 border-[1px] rounded-md px-2 items-center justify-between",children:[e,(0,d.jsx)("button",{onClick:()=>{return e=r,void p(h.filter(((r,t)=>t!==e)));var e},children:"x"})]},r)))})]}),(0,d.jsx)("div",{className:"flex justify-center mt-5 w-full",children:(0,d.jsx)("button",{onClick:async()=>{if((()=>{const e={};return 0===h.length&&(e.serialNumbers="At least one product is required"),f||(e.Serialrequired="Serial requirement status is required"),N(e),0===Object.keys(e).length})())try{const e=localStorage.getItem("token"),r=await s.A.post(`${L}/api/combo/addcomboproduct`,{products:t,Serialrequired:f,othername:g},{headers:{authtoken:e}});r.data.success?(i(r.data),A((0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("p",{className:"text-green-600 font-semibold text-lg mb-2",children:r.data.message}),(0,d.jsx)("div",{className:"relative w-full h-2 rounded-full overflow-hidden bg-green-200 mt-4",children:(0,d.jsx)("div",{className:"absolute top-0 left-0 h-full bg-green-500 animate-progress-bar2",style:{animationDuration:"0.5s"}})})]}))):A((0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("p",{className:"text-red-600 font-semibold text-lg mb-2",children:r.data.message}),(0,d.jsx)("div",{className:"relative w-full h-2 rounded-full overflow-hidden bg-red-200 mt-4",children:(0,d.jsx)("div",{className:"absolute top-0 left-0 h-full bg-red-500 animate-progress-bar2",style:{animationDuration:"0.5s"}})})]})),I(),o(""),v("YES"),b([]),p([]),k(""),u("")}catch(e){console.error("Error:",e)}},className:"bg-blue-500 text-white font-bold py-2 px-4 w-[50%] rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",children:"Add Combo"})})]})]})})}}}]);
//# sourceMappingURL=127.f6ef4b64.chunk.js.map