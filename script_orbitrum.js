/* =========================================================
   Fractal Cósmico — versão otimizada (B2: dinâmica fluida)
   script_orbitrum.js
   ========================================================= */

(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const create = (tag, cls) => { const e=document.createElement(tag); if(cls) e.className=cls; return e; };

  const BASE = {
    tamanhoGrande: 250,
    raioMedias: 180,
    raioPequenas: 60,
    raioMicros: 25,
    raioNanos: 10,
    raioPicos: 4,
    velocidadeMedias: 0.02,
    velocidadePequenas: 0.05,
    velocidadeMicros: 0.09,
    velocidadeNanos: 0.14,
    velocidadePicos: 0.22,
    velocidadeSistema: 0.004,
    raioSistema: 500,
    brilho: 1,
    intensidade: 0.5,
    opacidades: { grande: 1, medias: 1, pequenas: 1, micros: 1 }
  };

  const janela = document.querySelector(".janela-visual") || document.body;
  const containers = [1,2,3].map(i=>{
    let c=document.getElementById(`container${i}`);
    if(!c){ c=create("div","container"); c.id=`container${i}`; janela.appendChild(c); }
    return c;
  });

  function criarOrbitantes(pai, qtd, classe, raio){
    const arr=[];
    for(let i=0;i<qtd;i++){
      const el=create("div",`esfera ${classe}`);
      el.style.position="absolute";
      el.style.left="0"; el.style.top="0";
      pai.appendChild(el);
      arr.push({ el, raio, angulo:(i/qtd)*Math.PI*2 });
    }
    return arr;
  }

  const CORES = {
    grande: "#ffffff",
    media: "#3fa9f5",
    pequena: "#8aff3f",
    micro: "#ffcf3f",
    nano: "#ff3fa9",
    pico: "#a03fff"
  };

  function aplicarCores(opacidade=1, brilho=1, intensidade=0.5){
    for(const tipo in CORES){
      $$(".esfera."+tipo).forEach(e=>{
        e.style.background = CORES[tipo];
        e.style.opacity = opacidade;
        e.style.filter = `brightness(${brilho}) contrast(${1+intensidade})`;
      });
    }
  }

  function criarSistema(container, t, rM, rP, rMi, rN, rPi){
    container.innerHTML = "";
    let grande = create("div","esfera grande");
    container.appendChild(grande);
    grande.style.position="relative";
    grande.style.width=`${t}px`; grande.style.height=`${t}px`;

    const medias = criarOrbitantes(grande, 3, "media", rM);
    const pequenasPorMedia = medias.map(m => criarOrbitantes(m.el, 3, "pequena", rP));
    const microsPorPequena = pequenasPorMedia.map(g => g.map(p => criarOrbitantes(p.el, 3, "micro", rMi)));
    const nanosPorMicro = microsPorPequena.map(g => g.map(arr => arr.map(m => criarOrbitantes(m.el, 3, "nano", rN))));
    const picosPorNano = nanosPorMicro.map(g =>
      g.map(arr =>
        arr.map(sub =>
          sub.map(nano => criarOrbitantes(nano.el, 3, "pico", rPi))
        )
      )
    );

    return { grande, medias, pequenasPorMedia, microsPorPequena, nanosPorMicro, picosPorNano };
  }

  let sisA,sisB,sisC;

  function criarTodosSistemas(){
    sisA=criarSistema(containers[0],BASE.tamanhoGrande,BASE.raioMedias,BASE.raioPequenas,BASE.raioMicros,BASE.raioNanos,BASE.raioPicos);
    sisB=criarSistema(containers[1],BASE.tamanhoGrande*0.8,BASE.raioMedias*0.9,BASE.raioPequenas*0.9,BASE.raioMicros*0.9,BASE.raioNanos*0.9,BASE.raioPicos*0.9);
    sisC=criarSistema(containers[2],BASE.tamanhoGrande*0.8,BASE.raioMedias*0.9,BASE.raioPequenas*0.9,BASE.raioMicros*0.9,BASE.raioNanos*0.9,BASE.raioPicos*0.9);
  }

  function atualizarRaios(){
    // só atualiza os raios já existentes, sem recriar nada
    [...[sisA,sisB,sisC]].forEach((sys,idx)=>{
      if(!sys) return;
      const scale = idx===0 ? 1 : 0.9;
      sys.medias.forEach(m=>m.raio=BASE.raioMedias*scale);
      sys.pequenasPorMedia.flat().forEach(p=>p.raio=BASE.raioPequenas*scale);
      sys.microsPorPequena.flat(2).forEach(m=>m.raio=BASE.raioMicros*scale);
      sys.nanosPorMicro.flat(3).forEach(n=>n.raio=BASE.raioNanos*scale);
      sys.picosPorNano.flat(4).forEach(p=>p.raio=BASE.raioPicos*scale);
    });
  }

  function animarFractal(sys, delta){
    if(!sys) return;
    const { grande, medias, pequenasPorMedia, microsPorPequena, nanosPorMicro, picosPorNano } = sys;
    const rect=grande.getBoundingClientRect(), cx=rect.width/2, cy=rect.height/2;

    medias.forEach((m,i)=>{
      m.angulo+=BASE.velocidadeMedias*delta*60;
      const mw=m.el.offsetWidth,mh=m.el.offsetHeight;
      const x=cx+m.raio*Math.cos(m.angulo)-mw/2;
      const y=cy+m.raio*Math.sin(m.angulo)-mh/2;
      m.el.style.left=`${x}px`; m.el.style.top=`${y}px`;

      const cx2=mw/2, cy2=mh/2;
      const pequenas=pequenasPorMedia[i]||[];
      pequenas.forEach((p,j)=>{
        p.angulo+=BASE.velocidadePequenas*delta*60;
        const pw=p.el.offsetWidth,ph=p.el.offsetHeight;
        const x2=cx2+p.raio*Math.cos(p.angulo)-pw/2;
        const y2=cy2+p.raio*Math.sin(p.angulo)-ph/2;
        p.el.style.left=`${x2}px`; p.el.style.top=`${y2}px`;

        const cx3=pw/2, cy3=ph/2;
        const micros=microsPorPequena[i]?.[j]||[];
        micros.forEach((mi,k)=>{
          mi.angulo+=BASE.velocidadeMicros*delta*60;
          const mw2=mi.el.offsetWidth,mh2=mi.el.offsetHeight;
          const x3=cx3+mi.raio*Math.cos(mi.angulo)-mw2/2;
          const y3=cy3+mi.raio*Math.sin(mi.angulo)-mh2/2;
          mi.el.style.left=`${x3}px`; mi.el.style.top=`${y3}px`;

          const cx4=mw2/2, cy4=mh2/2;
          const nanos=nanosPorMicro[i]?.[j]?.[k]||[];
          nanos.forEach((n,l)=>{
            n.angulo+=BASE.velocidadeNanos*delta*60;
            const nw=n.el.offsetWidth,nh=n.el.offsetHeight;
            const x4=cx4+n.raio*Math.cos(n.angulo)-nw/2;
            const y4=cy4+n.raio*Math.sin(n.angulo)-nh/2;
            n.el.style.left=`${x4}px`; n.el.style.top=`${y4}px`;

            const cx5=nw/2, cy5=nh/2;
            const picos=picosPorNano[i]?.[j]?.[k]?.[l]||[];
            picos.forEach(pi=>{
              pi.angulo+=BASE.velocidadePicos*delta*60;
              const pw5=pi.el.offsetWidth,ph5=pi.el.offsetHeight;
              const x5=cx5+pi.raio*Math.cos(pi.angulo)-pw5/2;
              const y5=cy5+pi.raio*Math.sin(pi.angulo)-ph5/2;
              pi.el.style.left=`${x5}px`; pi.el.style.top=`${y5}px`;
            });
          });
        });
      });
    });
  }

  let last=performance.now(), angSistema=0, pausado=false;
  function loop(now){
    if(pausado) { requestAnimationFrame(loop); return; }
    const delta=(now-last)/1000; last=now;
    angSistema+=BASE.velocidadeSistema*delta*60;
    const centro={x:window.innerWidth*0.375,y:window.innerHeight/2};
    const r=BASE.raioSistema;
    containers.forEach((c,i)=>{
      const ang=angSistema+(i*(2*Math.PI/3));
      const x=centro.x+Math.cos(ang)*r;
      const y=centro.y+Math.sin(ang)*r;
      const off=c.offsetWidth/2, offY=c.offsetHeight/2;
      c.style.position="absolute";
      c.style.left=`${x-off}px`; c.style.top=`${y-offY}px`;
    });

    animarFractal(sisA,delta);
    animarFractal(sisB,delta);
    animarFractal(sisC,delta);
    requestAnimationFrame(loop);
  }

  document.addEventListener("DOMContentLoaded",()=>{
    criarTodosSistemas();
    aplicarCores(BASE.opacidades.grande, BASE.brilho, BASE.intensidade);
    last=performance.now();
    requestAnimationFrame(loop);
  });

  // Abas
  $$(".aba").forEach(aba=>{
    aba.addEventListener("click",()=>{
      $$(".aba").forEach(a=>a.classList.remove("ativa"));
      aba.classList.add("ativa");
      $$(".conteudo-aba").forEach(c=>c.classList.remove("ativa"));
      $("#"+aba.dataset.alvo).classList.add("ativa");
    });
  });

  // sliders
  const bindRange = (id, key, subkey, callback) => {
    const el = $("#"+id);
    if(!el) return;
    el.addEventListener("input",()=>{
      if(subkey) BASE[key][subkey]=parseFloat(el.value);
      else BASE[key]=parseFloat(el.value);
      if(callback) callback();
    });
  };

  // bindings
  bindRange("velocidadeMedias","velocidadeMedias");
  bindRange("velocidadePequenas","velocidadePequenas");
  bindRange("velocidadeMicros","velocidadeMicros");
  bindRange("velocidadeSistema","velocidadeSistema");
  bindRange("raioSistema","raioSistema");
  bindRange("tamanhoGrande","tamanhoGrande",null,criarTodosSistemas);

  // --- fluido: apenas atualiza raios ---
  bindRange("raioMedias","raioMedias",null,atualizarRaios);
  bindRange("raioPequenas","raioPequenas",null,atualizarRaios);
  bindRange("raioMicros","raioMicros",null,atualizarRaios);

  bindRange("brilho","brilho",null,()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));
  bindRange("intensidade","intensidade",null,()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));
  bindRange("opacidadeGrande","opacidades","grande",()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));
  bindRange("opacidadeMedias","opacidades","medias",()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));
  bindRange("opacidadePequenas","opacidades","pequenas",()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));
  bindRange("opacidadeMicros","opacidades","micros",()=>aplicarCores(BASE.opacidades.grande,BASE.brilho,BASE.intensidade));

  $("#pauseBtn").addEventListener("click",()=>{
    pausado=!pausado;
    $("#pauseBtn").textContent = pausado ? "▶️ Retomar" : "⏸️ Pausar";
  });

  window.__Orbitrum={BASE,atualizarRaios};
})();
