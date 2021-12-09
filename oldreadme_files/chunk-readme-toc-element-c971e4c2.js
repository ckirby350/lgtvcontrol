System.register(["./chunk-vendor.js","./chunk-frameworks.js"],function(){"use strict";var c,u,h,g;return{setters:[function(i){c=i.t,u=i.b,h=i.c},function(i){g=i.a3}],execute:function(){var i=Object.defineProperty,v=Object.getOwnPropertyDescriptor,b=(n,e)=>i(n,"name",{value:e,configurable:!0}),a=(n,e,o,t)=>{for(var r=t>1?void 0:t?v(e,o):e,l=n.length-1,d;l>=0;l--)(d=n[l])&&(r=(t?d(e,o,r):d(r))||r);return t&&r&&i(e,o,r),r};let s=class extends HTMLElement{connectedCallback(){var n;(n=this.trigger)==null||n.addEventListener("menu:activate",this.onMenuOpened.bind(this));const e=this.getHeadings();this.observer=new IntersectionObserver(()=>this.observerCallback(),{root:null,rootMargin:"0px",threshold:1});for(const o of e||[])this.observer.observe(o)}disconnectedCallback(){var n,e;(n=this.trigger)==null||n.removeEventListener("menu:activate",this.onMenuOpened),(e=this.observer)==null||e.disconnect()}blur(){window.setTimeout(()=>{document.activeElement&&document.activeElement.blur()},0)}onMenuOpened(n){const e=n.currentTarget,o=e.getAttribute("data-menu-hydro-click")||"",t=e.getAttribute("data-menu-hydro-click-hmac")||"",r=e.getAttribute("data-hydro-client-context")||"";g(o,t,r),this.observerCallback()}getHeadings(){return this.content?this.content.querySelectorAll("h1,h2,h3,h4,h5,h6"):null}observerCallback(){const o=Array.prototype.slice.call(this.getHeadings()).filter(t=>this.isElementInViewPort(t))[0];for(const t of this.entries||[])t.removeAttribute("aria-current"),t.style.backgroundColor="";if(o){const t=this.mapHeadingToListItemUsingAnchor(o);if(t){t.setAttribute("aria-current","page"),t.style.backgroundColor="var(--color-accent-emphasis)";const r=t.closest("div");r&&t.offsetTop&&(r.scrollTop=t.offsetTop-parseInt(getComputedStyle(r).paddingTop))}}}isElementInViewPort(n){return n.getBoundingClientRect().y>=0}mapHeadingToListItemUsingAnchor(n){const e=n.getElementsByTagName("a")[0];if(e&&this.entries)return this.entries.find(o=>o.href.replace("user-content-","")===e.href)}};b(s,"ReadmeTocElement"),a([c],s.prototype,"trigger",2),a([c],s.prototype,"content",2),a([u],s.prototype,"entries",2),s=a([h],s)}}});
//# sourceMappingURL=chunk-readme-toc-element-cff2917b.js.map
