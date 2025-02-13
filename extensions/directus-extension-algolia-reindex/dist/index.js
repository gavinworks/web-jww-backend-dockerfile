import{createHmac as e}from"crypto";import*as t from"http";import{Agent as r}from"http";import*as s from"https";import{Agent as a}from"https";import{parse as o}from"url";function n(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function i(e){if(e.__esModule)return e;var t=e.default;if("function"==typeof t){var r=function e(){return this instanceof e?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};r.prototype=t.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(e).forEach((function(t){var s=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(r,t,s.get?s:{enumerable:!0,get:function(){return e[t]}})})),r}var c={exports:{}};function l(){return{get:(e,t,r={miss:()=>Promise.resolve()})=>t().then((e=>Promise.all([e,r.miss(e)]))).then((([e])=>e)),set:(e,t)=>Promise.resolve(t),delete:e=>Promise.resolve(),clear:()=>Promise.resolve()}}var d=Object.freeze({__proto__:null,createFallbackableCache:function e(t){const r=[...t.caches],s=r.shift();return void 0===s?l():{get:(t,a,o={miss:()=>Promise.resolve()})=>s.get(t,a,o).catch((()=>e({caches:r}).get(t,a,o))),set:(t,a)=>s.set(t,a).catch((()=>e({caches:r}).set(t,a))),delete:t=>s.delete(t).catch((()=>e({caches:r}).delete(t))),clear:()=>s.clear().catch((()=>e({caches:r}).clear()))}},createNullCache:l}),u=i(d);var p=i(Object.freeze({__proto__:null,createInMemoryCache:function(e={serializable:!0}){let t={};return{get(r,s,a={miss:()=>Promise.resolve()}){const o=JSON.stringify(r);if(o in t)return Promise.resolve(e.serializable?JSON.parse(t[o]):t[o]);const n=s(),i=a&&a.miss||(()=>Promise.resolve());return n.then((e=>i(e))).then((()=>n))},set:(r,s)=>(t[JSON.stringify(r)]=e.serializable?JSON.stringify(s):s,Promise.resolve(s)),delete:e=>(delete t[JSON.stringify(e)],Promise.resolve()),clear:()=>(t={},Promise.resolve())}}}));function m(e,t,r){const s={"x-algolia-api-key":r,"x-algolia-application-id":t};return{headers:()=>e===P.WithinHeaders?s:{},queryParameters:()=>e===P.WithinQueryParameters?s:{}}}function h(e){let t=0;const r=()=>(t++,new Promise((s=>{setTimeout((()=>{s(e(r))}),Math.min(100*t,1e3))})));return e(r)}function g(e,t=(e,t)=>Promise.resolve()){return Object.assign(e,{wait:r=>g(e.then((e=>Promise.all([t(e,r),e]))).then((e=>e[1])))})}function y(e){let t=e.length-1;for(;t>0;t--){const r=Math.floor(Math.random()*(t+1)),s=e[t];e[t]=e[r],e[r]=s}return e}function b(e,t){return t?(Object.keys(t).forEach((r=>{e[r]=t[r](e)})),e):e}function f(e,...t){let r=0;return e.replace(/%s/g,(()=>encodeURIComponent(t[r++])))}const P={WithinQueryParameters:0,WithinHeaders:1};var I=Object.freeze({__proto__:null,AuthMode:P,addMethods:b,createAuth:m,createRetryablePromise:h,createWaitablePromise:g,destroy:e=>()=>e.transporter.requester.destroy(),encode:f,shuffle:y,version:"4.24.0"});const D={Delete:"DELETE",Get:"GET",Post:"POST",Put:"PUT"};var j=Object.freeze({__proto__:null,MethodEnum:D});function x(e,t){const r=e||{},s=r.data||{};return Object.keys(r).forEach((e=>{-1===["timeout","headers","queryParameters","data","cacheable"].indexOf(e)&&(s[e]=r[e])})),{data:Object.entries(s).length>0?s:void 0,timeout:r.timeout||t,headers:r.headers||{},queryParameters:r.queryParameters||{},cacheable:r.cacheable}}const A={Read:1,Write:2,Any:3},O={Up:1,Down:2,Timeouted:3},v=12e4;function S(e,t=O.Up){return{...e,status:t,lastUpdate:Date.now()}}function w(e){return e.status===O.Up||Date.now()-e.lastUpdate>v}function q(e){return e.status===O.Timeouted&&Date.now()-e.lastUpdate<=v}function T(e){return"string"==typeof e?{protocol:"https",url:e,accept:A.Any}:{protocol:e.protocol||"https",url:e.url,accept:e.accept||A.Any}}function k(e,t,r,s){const a=[],o=_(r,s),n=F(e,s),i=r.method,c=r.method!==D.Get?{}:{...r.data,...s.data},l={"x-algolia-agent":e.userAgent.value,...e.queryParameters,...c,...s.queryParameters};let d=0;const u=(t,c)=>{const p=t.pop();if(void 0===p)throw K(z(a));const m={data:o,headers:n,method:i,url:C(p,r.path,l),connectTimeout:c(d,e.timeouts.connect),responseTimeout:c(d,s.timeout)},h=e=>{const r={request:m,response:e,host:p,triesLeft:t.length};return a.push(r),r},g={onSuccess:e=>E(e),onRetry(r){const s=h(r);return r.isTimedOut&&d++,Promise.all([e.logger.info("Retryable failure",M(s)),e.hostsCache.set(p,S(p,r.isTimedOut?O.Timeouted:O.Down))]).then((()=>u(t,c)))},onFail(e){throw h(e),N(e,z(a))}};return e.requester.send(m).then((e=>((e,t)=>(e=>{const t=e.status;return e.isTimedOut||(({isTimedOut:e,status:t})=>!e&&!~~t)(e)||2!=~~(t/100)&&4!=~~(t/100)})(e)?t.onRetry(e):(({status:e})=>2==~~(e/100))(e)?t.onSuccess(e):t.onFail(e))(e,g)))};return function(e,t){return Promise.all(t.map((t=>e.get(t,(()=>Promise.resolve(S(t))))))).then((e=>{const r=e.filter((e=>w(e))),s=e.filter((e=>q(e))),a=[...r,...s];return{getTimeout:(e,t)=>(0===s.length&&0===e?1:s.length+3+e)*t,statelessHosts:a.length>0?a.map((e=>T(e))):t}}))}(e.hostsCache,t).then((e=>u([...e.statelessHosts].reverse(),e.getTimeout)))}function R(e){const{hostsCache:t,logger:r,requester:s,requestsCache:a,responsesCache:o,timeouts:n,userAgent:i,hosts:c,queryParameters:l,headers:d}=e,u={hostsCache:t,logger:r,requester:s,requestsCache:a,responsesCache:o,timeouts:n,userAgent:i,headers:d,queryParameters:l,hosts:c.map((e=>T(e))),read(e,t){const r=x(t,u.timeouts.read),s=()=>k(u,u.hosts.filter((e=>!!(e.accept&A.Read))),e,r);if(!0!==(void 0!==r.cacheable?r.cacheable:e.cacheable))return s();const a={request:e,mappedRequestOptions:r,transporter:{queryParameters:u.queryParameters,headers:u.headers}};return u.responsesCache.get(a,(()=>u.requestsCache.get(a,(()=>u.requestsCache.set(a,s()).then((e=>Promise.all([u.requestsCache.delete(a),e])),(e=>Promise.all([u.requestsCache.delete(a),Promise.reject(e)]))).then((([e,t])=>t))))),{miss:e=>u.responsesCache.set(a,e)})},write:(e,t)=>k(u,u.hosts.filter((e=>!!(e.accept&A.Write))),e,x(t,u.timeouts.write))};return u}function E(e){try{return JSON.parse(e.content)}catch(t){throw B(t.message,e)}}function N({content:e,status:t},r){let s=e;try{s=JSON.parse(e).message}catch(e){}return G(s,t,r)}function C(e,t,r){const s=U(r);let a=`${e.protocol}://${e.url}/${"/"===t.charAt(0)?t.substr(1):t}`;return s.length&&(a+=`?${s}`),a}function U(e){return Object.keys(e).map((t=>{return function(e,...t){let r=0;return e.replace(/%s/g,(()=>encodeURIComponent(t[r++])))}("%s=%s",t,(r=e[t],"[object Object]"===Object.prototype.toString.call(r)||"[object Array]"===Object.prototype.toString.call(r)?JSON.stringify(e[t]):e[t]));var r})).join("&")}function _(e,t){if(e.method===D.Get||void 0===e.data&&void 0===t.data)return;const r=Array.isArray(e.data)?e.data:{...e.data,...t.data};return JSON.stringify(r)}function F(e,t){const r={...e.headers,...t.headers},s={};return Object.keys(r).forEach((e=>{const t=r[e];s[e.toLowerCase()]=t})),s}function z(e){return e.map((e=>M(e)))}function M(e){const t=e.request.headers["x-algolia-api-key"]?{"x-algolia-api-key":"*****"}:{};return{...e,request:{...e.request,headers:{...e.request.headers,...t}}}}function G(e,t,r){return{name:"ApiError",message:e,status:t,transporterStackTrace:r}}function B(e,t){return{name:"DeserializationError",message:e,response:t}}function K(e){return{name:"RetryError",message:"Unreachable hosts - your application id may be incorrect. If the error persists, please reach out to the Algolia Support team: https://alg.li/support .",transporterStackTrace:e}}var $=Object.freeze({__proto__:null,CallEnum:A,HostStatusEnum:O,createApiError:G,createDeserializationError:B,createMappedRequestOptions:x,createRetryError:K,createStatefulHost:S,createStatelessHost:T,createTransporter:R,createUserAgent:function(e){const t={value:`Algolia for JavaScript (${e})`,add(e){const r=`; ${e.segment}${void 0!==e.version?` (${e.version})`:""}`;return-1===t.value.indexOf(r)&&(t.value=`${t.value}${r}`),t}};return t},deserializeFailure:N,deserializeSuccess:E,isStatefulHostTimeouted:q,isStatefulHostUp:w,serializeData:_,serializeHeaders:F,serializeQueryParameters:U,serializeUrl:C,stackFrameWithoutCredentials:M,stackTraceWithoutCredentials:z});var L=Object.freeze({__proto__:null,addABTest:e=>(t,r)=>e.transporter.write({method:D.Post,path:"2/abtests",data:t},r),createAnalyticsClient:e=>{const t=e.region||"us",r=m(P.WithinHeaders,e.appId,e.apiKey),s=R({hosts:[{url:`analytics.${t}.algolia.com`}],...e,headers:{...r.headers(),"content-type":"application/json",...e.headers},queryParameters:{...r.queryParameters(),...e.queryParameters}});return b({appId:e.appId,transporter:s},e.methods)},deleteABTest:e=>(t,r)=>e.transporter.write({method:D.Delete,path:f("2/abtests/%s",t)},r),getABTest:e=>(t,r)=>e.transporter.read({method:D.Get,path:f("2/abtests/%s",t)},r),getABTests:e=>t=>e.transporter.read({method:D.Get,path:"2/abtests"},t),stopABTest:e=>(t,r)=>e.transporter.write({method:D.Post,path:f("2/abtests/%s/stop",t)},r)}),H=i(L),V=i(I);var W=Object.freeze({__proto__:null,createPersonalizationClient:e=>{const t=e.region||"us",r=m(P.WithinHeaders,e.appId,e.apiKey),s=R({hosts:[{url:`personalization.${t}.algolia.com`}],...e,headers:{...r.headers(),"content-type":"application/json",...e.headers},queryParameters:{...r.queryParameters(),...e.queryParameters}});return b({appId:e.appId,transporter:s},e.methods)},getPersonalizationStrategy:e=>t=>e.transporter.read({method:D.Get,path:"1/strategies/personalization"},t),setPersonalizationStrategy:e=>(t,r)=>e.transporter.write({method:D.Post,path:"1/strategies/personalization",data:t},r)}),Q=i(W);function J(e){const t=r=>e.request(r).then((s=>{if(void 0!==e.batch&&e.batch(s.hits),!e.shouldStop(s))return s.cursor?t({cursor:s.cursor}):t({page:(r.page||0)+1})}));return t({})}function Y(){return{name:"MissingObjectIDError",message:"All objects must have an unique objectID (like a primary key) to be valid. Algolia is also able to generate objectIDs automatically but *it's not recommended*. To do it, use the `{'autoGenerateObjectIDIfNotExist': true}` option."}}function X(){return{name:"ObjectNotFoundError",message:"Object not found."}}function Z(){return{name:"ValidUntilNotFoundError",message:"ValidUntil not found in given secured api key."}}const ee=e=>(t,r,s)=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/operation",t),data:{operation:"copy",destination:r}},s),((r,s)=>se(e)(t,{methods:{waitTask:fe}}).waitTask(r.taskID,s))),te=e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/keys/%s",t)},r),re=e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/task/%s",t.toString())},r),se=e=>(t,r={})=>b({transporter:e.transporter,appId:e.appId,indexName:t},r.methods),ae=e=>(t,r)=>h((s=>re(e)(t,r).then((e=>"published"!==e.status?s():void 0)))),oe=e=>(t,r)=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/batch",e.indexName),data:{requests:t}},r),((t,r)=>fe(e)(t.taskID,r))),ne=e=>(t,r,s)=>{const{batchSize:a,...o}=s||{},n={taskIDs:[],objectIDs:[]},i=(s=0)=>{const c=[];let l;for(l=s;l<t.length&&(c.push(t[l]),c.length!==(a||1e3));l++);return 0===c.length?Promise.resolve(n):oe(e)(c.map((e=>({action:r,body:e}))),o).then((e=>(n.objectIDs=n.objectIDs.concat(e.objectIDs),n.taskIDs.push(e.taskID),l++,i(l))))};return g(i(),((t,r)=>Promise.all(t.taskIDs.map((t=>fe(e)(t,r))))))},ie=e=>(t,r)=>{const s=t.map((e=>({objectID:e})));return ne(e)(s,Pe.DeleteObject,r)},ce=e=>t=>e.transporter.read({method:D.Get,path:f("1/indexes/%s/settings",e.indexName),data:{getVersion:2}},t),le=e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/indexes/%s/task/%s",e.indexName,t.toString())},r),de=e=>(t,r)=>{const{createIfNotExists:s,...a}=r||{},o=s?Pe.PartialUpdateObject:Pe.PartialUpdateObjectNoCreate;return ne(e)(t,o,a)},ue=e=>(t,r)=>{const{autoGenerateObjectIDIfNotExist:s,...a}=r||{},o=s?Pe.AddObject:Pe.UpdateObject;if(o===Pe.UpdateObject)for(const e of t)if(void 0===e.objectID)return g(Promise.reject({name:"MissingObjectIDError",message:"All objects must have an unique objectID (like a primary key) to be valid. Algolia is also able to generate objectIDs automatically but *it's not recommended*. To do it, use the `{'autoGenerateObjectIDIfNotExist': true}` option."}));return ne(e)(t,o,a)},pe=e=>(t,r)=>{const{forwardToReplicas:s,clearExistingRules:a,...o}=r||{},n=x(o);return s&&(n.queryParameters.forwardToReplicas=1),a&&(n.queryParameters.clearExistingRules=1),g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/rules/batch",e.indexName),data:t},n),((t,r)=>fe(e)(t.taskID,r)))},me=e=>(t,r)=>{const{forwardToReplicas:s,clearExistingSynonyms:a,replaceExistingSynonyms:o,...n}=r||{},i=x(n);return s&&(i.queryParameters.forwardToReplicas=1),(o||a)&&(i.queryParameters.replaceExistingSynonyms=1),g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/synonyms/batch",e.indexName),data:t},i),((t,r)=>fe(e)(t.taskID,r)))},he=e=>(t,r)=>e.transporter.read({method:D.Post,path:f("1/indexes/%s/query",e.indexName),data:{query:t},cacheable:!0},r),ge=e=>(t,r,s)=>e.transporter.read({method:D.Post,path:f("1/indexes/%s/facets/%s/query",e.indexName,t),data:{facetQuery:r},cacheable:!0},s),ye=e=>(t,r)=>e.transporter.read({method:D.Post,path:f("1/indexes/%s/rules/search",e.indexName),data:{query:t}},r),be=e=>(t,r)=>e.transporter.read({method:D.Post,path:f("1/indexes/%s/synonyms/search",e.indexName),data:{query:t}},r),fe=e=>(t,r)=>h((s=>le(e)(t,r).then((e=>"published"!==e.status?s():void 0)))),Pe={AddObject:"addObject",UpdateObject:"updateObject",PartialUpdateObject:"partialUpdateObject",PartialUpdateObjectNoCreate:"partialUpdateObjectNoCreate",DeleteObject:"deleteObject",DeleteIndex:"delete",ClearIndex:"clear"},Ie={Settings:"settings",Synonyms:"synonyms",Rules:"rules"};var De=Object.freeze({__proto__:null,ApiKeyACLEnum:{AddObject:"addObject",Analytics:"analytics",Browser:"browse",DeleteIndex:"deleteIndex",DeleteObject:"deleteObject",EditSettings:"editSettings",Inference:"inference",ListIndexes:"listIndexes",Logs:"logs",Personalization:"personalization",Recommendation:"recommendation",Search:"search",SeeUnretrievableAttributes:"seeUnretrievableAttributes",Settings:"settings",Usage:"usage"},BatchActionEnum:Pe,ScopeEnum:Ie,StrategyEnum:{None:"none",StopIfEnoughMatches:"stopIfEnoughMatches"},SynonymEnum:{Synonym:"synonym",OneWaySynonym:"oneWaySynonym",AltCorrection1:"altCorrection1",AltCorrection2:"altCorrection2",Placeholder:"placeholder"},addApiKey:e=>(t,r)=>{const{queryParameters:s,...a}=r||{},o={acl:t,...void 0!==s?{queryParameters:s}:{}};return g(e.transporter.write({method:D.Post,path:"1/keys",data:o},a),((t,r)=>h((s=>te(e)(t.key,r).catch((e=>{if(404!==e.status)throw e;return s()}))))))},assignUserID:e=>(t,r,s)=>{const a=x(s);return a.queryParameters["X-Algolia-User-ID"]=t,e.transporter.write({method:D.Post,path:"1/clusters/mapping",data:{cluster:r}},a)},assignUserIDs:e=>(t,r,s)=>e.transporter.write({method:D.Post,path:"1/clusters/mapping/batch",data:{users:t,cluster:r}},s),batch:oe,browseObjects:e=>t=>J({shouldStop:e=>void 0===e.cursor,...t,request:r=>e.transporter.read({method:D.Post,path:f("1/indexes/%s/browse",e.indexName),data:r},t)}),browseRules:e=>t=>{const r={hitsPerPage:1e3,...t};return J({shouldStop:e=>e.hits.length<r.hitsPerPage,...r,request:t=>ye(e)("",{...r,...t}).then((e=>({...e,hits:e.hits.map((e=>(delete e._highlightResult,e)))})))})},browseSynonyms:e=>t=>{const r={hitsPerPage:1e3,...t};return J({shouldStop:e=>e.hits.length<r.hitsPerPage,...r,request:t=>be(e)("",{...r,...t}).then((e=>({...e,hits:e.hits.map((e=>(delete e._highlightResult,e)))})))})},chunkedBatch:ne,clearDictionaryEntries:e=>(t,r)=>g(e.transporter.write({method:D.Post,path:f("/1/dictionaries/%s/batch",t),data:{clearExistingDictionaryEntries:!0,requests:{action:"addEntry",body:[]}}},r),((t,r)=>ae(e)(t.taskID,r))),clearObjects:e=>t=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/clear",e.indexName)},t),((t,r)=>fe(e)(t.taskID,r))),clearRules:e=>t=>{const{forwardToReplicas:r,...s}=t||{},a=x(s);return r&&(a.queryParameters.forwardToReplicas=1),g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/rules/clear",e.indexName)},a),((t,r)=>fe(e)(t.taskID,r)))},clearSynonyms:e=>t=>{const{forwardToReplicas:r,...s}=t||{},a=x(s);return r&&(a.queryParameters.forwardToReplicas=1),g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/synonyms/clear",e.indexName)},a),((t,r)=>fe(e)(t.taskID,r)))},copyIndex:ee,copyRules:e=>(t,r,s)=>ee(e)(t,r,{...s,scope:[Ie.Rules]}),copySettings:e=>(t,r,s)=>ee(e)(t,r,{...s,scope:[Ie.Settings]}),copySynonyms:e=>(t,r,s)=>ee(e)(t,r,{...s,scope:[Ie.Synonyms]}),createBrowsablePromise:J,createMissingObjectIDError:Y,createObjectNotFoundError:X,createSearchClient:e=>{const t=e.appId,r=m(void 0!==e.authMode?e.authMode:P.WithinHeaders,t,e.apiKey),s=R({hosts:[{url:`${t}-dsn.algolia.net`,accept:A.Read},{url:`${t}.algolia.net`,accept:A.Write}].concat(y([{url:`${t}-1.algolianet.com`},{url:`${t}-2.algolianet.com`},{url:`${t}-3.algolianet.com`}])),...e,headers:{...r.headers(),"content-type":"application/x-www-form-urlencoded",...e.headers},queryParameters:{...r.queryParameters(),...e.queryParameters}}),a={transporter:s,appId:t,addAlgoliaAgent(e,t){s.userAgent.add({segment:e,version:t})},clearCache:()=>Promise.all([s.requestsCache.clear(),s.responsesCache.clear()]).then((()=>{}))};return b(a,e.methods)},createValidUntilNotFoundError:Z,customRequest:e=>(t,r)=>t.method===D.Get?e.transporter.read(t,r):e.transporter.write(t,r),deleteApiKey:e=>(t,r)=>g(e.transporter.write({method:D.Delete,path:f("1/keys/%s",t)},r),((r,s)=>h((r=>te(e)(t,s).then(r).catch((e=>{if(404!==e.status)throw e})))))),deleteBy:e=>(t,r)=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/deleteByQuery",e.indexName),data:t},r),((t,r)=>fe(e)(t.taskID,r))),deleteDictionaryEntries:e=>(t,r,s)=>{const a=r.map((e=>({action:"deleteEntry",body:{objectID:e}})));return g(e.transporter.write({method:D.Post,path:f("/1/dictionaries/%s/batch",t),data:{clearExistingDictionaryEntries:!1,requests:a}},s),((t,r)=>ae(e)(t.taskID,r)))},deleteIndex:e=>t=>g(e.transporter.write({method:D.Delete,path:f("1/indexes/%s",e.indexName)},t),((t,r)=>fe(e)(t.taskID,r))),deleteObject:e=>(t,r)=>g(ie(e)([t],r).then((e=>({taskID:e.taskIDs[0]}))),((t,r)=>fe(e)(t.taskID,r))),deleteObjects:ie,deleteRule:e=>(t,r)=>{const{forwardToReplicas:s,...a}=r||{},o=x(a);return s&&(o.queryParameters.forwardToReplicas=1),g(e.transporter.write({method:D.Delete,path:f("1/indexes/%s/rules/%s",e.indexName,t)},o),((t,r)=>fe(e)(t.taskID,r)))},deleteSynonym:e=>(t,r)=>{const{forwardToReplicas:s,...a}=r||{},o=x(a);return s&&(o.queryParameters.forwardToReplicas=1),g(e.transporter.write({method:D.Delete,path:f("1/indexes/%s/synonyms/%s",e.indexName,t)},o),((t,r)=>fe(e)(t.taskID,r)))},exists:e=>t=>ce(e)(t).then((()=>!0)).catch((e=>{if(404!==e.status)throw e;return!1})),findAnswers:e=>(t,r,s)=>e.transporter.read({method:D.Post,path:f("1/answers/%s/prediction",e.indexName),data:{query:t,queryLanguages:r},cacheable:!0},s),findObject:e=>(t,r)=>{const{query:s,paginate:a,...o}=r||{};let n=0;const i=()=>he(e)(s||"",{...o,page:n}).then((e=>{for(const[r,s]of Object.entries(e.hits))if(t(s))return{object:s,position:parseInt(r,10),page:n};if(n++,!1===a||n>=e.nbPages)throw{name:"ObjectNotFoundError",message:"Object not found."};return i()}));return i()},generateSecuredApiKey:()=>(t,r)=>{const s=U(r),a=e("sha256",t).update(s).digest("hex");return Buffer.from(a+s).toString("base64")},getApiKey:te,getAppTask:re,getDictionarySettings:e=>t=>e.transporter.read({method:D.Get,path:"/1/dictionaries/*/settings"},t),getLogs:e=>t=>e.transporter.read({method:D.Get,path:"1/logs"},t),getObject:e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/indexes/%s/%s",e.indexName,t)},r),getObjectPosition:()=>(e,t)=>{for(const[r,s]of Object.entries(e.hits))if(s.objectID===t)return parseInt(r,10);return-1},getObjects:e=>(t,r)=>{const{attributesToRetrieve:s,...a}=r||{},o=t.map((t=>({indexName:e.indexName,objectID:t,...s?{attributesToRetrieve:s}:{}})));return e.transporter.read({method:D.Post,path:"1/indexes/*/objects",data:{requests:o}},a)},getRule:e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/indexes/%s/rules/%s",e.indexName,t)},r),getSecuredApiKeyRemainingValidity:()=>e=>{const t=Buffer.from(e,"base64").toString("ascii").match(/validUntil=(\d+)/);if(null===t)throw{name:"ValidUntilNotFoundError",message:"ValidUntil not found in given secured api key."};return parseInt(t[1],10)-Math.round((new Date).getTime()/1e3)},getSettings:ce,getSynonym:e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/indexes/%s/synonyms/%s",e.indexName,t)},r),getTask:le,getTopUserIDs:e=>t=>e.transporter.read({method:D.Get,path:"1/clusters/mapping/top"},t),getUserID:e=>(t,r)=>e.transporter.read({method:D.Get,path:f("1/clusters/mapping/%s",t)},r),hasPendingMappings:e=>t=>{const{retrieveMappings:r,...s}=t||{};return!0===r&&(s.getClusters=!0),e.transporter.read({method:D.Get,path:"1/clusters/mapping/pending"},s)},initIndex:se,listApiKeys:e=>t=>e.transporter.read({method:D.Get,path:"1/keys"},t),listClusters:e=>t=>e.transporter.read({method:D.Get,path:"1/clusters"},t),listIndices:e=>t=>e.transporter.read({method:D.Get,path:"1/indexes"},t),listUserIDs:e=>t=>e.transporter.read({method:D.Get,path:"1/clusters/mapping"},t),moveIndex:e=>(t,r,s)=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/operation",t),data:{operation:"move",destination:r}},s),((r,s)=>se(e)(t,{methods:{waitTask:fe}}).waitTask(r.taskID,s))),multipleBatch:e=>(t,r)=>g(e.transporter.write({method:D.Post,path:"1/indexes/*/batch",data:{requests:t}},r),((t,r)=>Promise.all(Object.keys(t.taskID).map((s=>se(e)(s,{methods:{waitTask:fe}}).waitTask(t.taskID[s],r)))))),multipleGetObjects:e=>(t,r)=>e.transporter.read({method:D.Post,path:"1/indexes/*/objects",data:{requests:t}},r),multipleQueries:e=>(t,r)=>{const s=t.map((e=>({...e,params:U(e.params||{})})));return e.transporter.read({method:D.Post,path:"1/indexes/*/queries",data:{requests:s},cacheable:!0},r)},multipleSearchForFacetValues:e=>(t,r)=>Promise.all(t.map((t=>{const{facetName:s,facetQuery:a,...o}=t.params;return se(e)(t.indexName,{methods:{searchForFacetValues:ge}}).searchForFacetValues(s,a,{...r,...o})}))),partialUpdateObject:e=>(t,r)=>g(de(e)([t],r).then((e=>({objectID:e.objectIDs[0],taskID:e.taskIDs[0]}))),((t,r)=>fe(e)(t.taskID,r))),partialUpdateObjects:de,removeUserID:e=>(t,r)=>{const s=x(r);return s.queryParameters["X-Algolia-User-ID"]=t,e.transporter.write({method:D.Delete,path:"1/clusters/mapping"},s)},replaceAllObjects:e=>(t,r)=>{const{safe:s,autoGenerateObjectIDIfNotExist:a,batchSize:o,...n}=r||{},i=(t,r,s,a)=>g(e.transporter.write({method:D.Post,path:f("1/indexes/%s/operation",t),data:{operation:s,destination:r}},a),((t,r)=>fe(e)(t.taskID,r))),c=Math.random().toString(36).substring(7),l=`${e.indexName}_tmp_${c}`,d=ue({appId:e.appId,transporter:e.transporter,indexName:l});let u=[];const p=i(e.indexName,l,"copy",{...n,scope:["settings","synonyms","rules"]});u.push(p);return g((s?p.wait(n):p).then((()=>{const e=d(t,{...n,autoGenerateObjectIDIfNotExist:a,batchSize:o});return u.push(e),s?e.wait(n):e})).then((()=>{const t=i(l,e.indexName,"move",n);return u.push(t),s?t.wait(n):t})).then((()=>Promise.all(u))).then((([e,t,r])=>({objectIDs:t.objectIDs,taskIDs:[e.taskID,...t.taskIDs,r.taskID]}))),((e,t)=>Promise.all(u.map((e=>e.wait(t))))))},replaceAllRules:e=>(t,r)=>pe(e)(t,{...r,clearExistingRules:!0}),replaceAllSynonyms:e=>(t,r)=>me(e)(t,{...r,clearExistingSynonyms:!0}),replaceDictionaryEntries:e=>(t,r,s)=>{const a=r.map((e=>({action:"addEntry",body:e})));return g(e.transporter.write({method:D.Post,path:f("/1/dictionaries/%s/batch",t),data:{clearExistingDictionaryEntries:!0,requests:a}},s),((t,r)=>ae(e)(t.taskID,r)))},restoreApiKey:e=>(t,r)=>g(e.transporter.write({method:D.Post,path:f("1/keys/%s/restore",t)},r),((r,s)=>h((r=>te(e)(t,s).catch((e=>{if(404!==e.status)throw e;return r()})))))),saveDictionaryEntries:e=>(t,r,s)=>{const a=r.map((e=>({action:"addEntry",body:e})));return g(e.transporter.write({method:D.Post,path:f("/1/dictionaries/%s/batch",t),data:{clearExistingDictionaryEntries:!1,requests:a}},s),((t,r)=>ae(e)(t.taskID,r)))},saveObject:e=>(t,r)=>g(ue(e)([t],r).then((e=>({objectID:e.objectIDs[0],taskID:e.taskIDs[0]}))),((t,r)=>fe(e)(t.taskID,r))),saveObjects:ue,saveRule:e=>(t,r)=>pe(e)([t],r),saveRules:pe,saveSynonym:e=>(t,r)=>me(e)([t],r),saveSynonyms:me,search:he,searchDictionaryEntries:e=>(t,r,s)=>e.transporter.read({method:D.Post,path:f("/1/dictionaries/%s/search",t),data:{query:r},cacheable:!0},s),searchForFacetValues:ge,searchRules:ye,searchSynonyms:be,searchUserIDs:e=>(t,r)=>e.transporter.read({method:D.Post,path:"1/clusters/mapping/search",data:{query:t}},r),setDictionarySettings:e=>(t,r)=>g(e.transporter.write({method:D.Put,path:"/1/dictionaries/*/settings",data:t},r),((t,r)=>ae(e)(t.taskID,r))),setSettings:e=>(t,r)=>{const{forwardToReplicas:s,...a}=r||{},o=x(a);return s&&(o.queryParameters.forwardToReplicas=1),g(e.transporter.write({method:D.Put,path:f("1/indexes/%s/settings",e.indexName),data:t},o),((t,r)=>fe(e)(t.taskID,r)))},updateApiKey:e=>(t,r)=>{const s=Object.assign({},r),{queryParameters:a,...o}=r||{},n=a?{queryParameters:a}:{},i=["acl","indexes","referers","restrictSources","queryParameters","description","maxQueriesPerIPPerHour","maxHitsPerQuery"];return g(e.transporter.write({method:D.Put,path:f("1/keys/%s",t),data:n},o),((r,a)=>h((r=>te(e)(t,a).then((e=>(e=>Object.keys(s).filter((e=>-1!==i.indexOf(e))).every((t=>{if(Array.isArray(e[t])&&Array.isArray(s[t])){const r=e[t];return r.length===s[t].length&&r.every(((e,r)=>e===s[t][r]))}return e[t]===s[t]})))(e)?Promise.resolve():r()))))))},waitAppTask:ae,waitTask:fe}),je=i(De);var xe=i(Object.freeze({__proto__:null,LogLevelEnum:{Debug:1,Info:2,Error:3},createNullLogger:function(){return{debug:(e,t)=>Promise.resolve(),info:(e,t)=>Promise.resolve(),error:(e,t)=>Promise.resolve()}}})),Ae={exports:{}};const Oe={keepAlive:!0},ve=new r(Oe),Se=new a(Oe);var we=i(Object.freeze({__proto__:null,createNodeHttpRequester:function({agent:e,httpAgent:r,httpsAgent:a,requesterOptions:n={}}={}){const i=r||e||ve,c=a||e||Se;return{send:e=>new Promise((r=>{const a=o(e.url),l=null===a.query?a.pathname:`${a.pathname}?${a.query}`,d={...n,agent:"https:"===a.protocol?c:i,hostname:a.hostname,path:l,method:e.method,headers:{...n&&n.headers?n.headers:{},...e.headers},...void 0!==a.port?{port:a.port||""}:{}},u=("https:"===a.protocol?s:t).request(d,(e=>{let t=[];e.on("data",(e=>{t=t.concat(e)})),e.on("end",(()=>{clearTimeout(m),clearTimeout(h),r({status:e.statusCode||0,content:Buffer.concat(t).toString(),isTimedOut:!1})}))})),p=(e,t)=>setTimeout((()=>{u.abort(),r({status:0,content:t,isTimedOut:!0})}),1e3*e),m=p(e.connectTimeout,"Connection timeout");let h;u.on("error",(e=>{clearTimeout(m),clearTimeout(h),r({status:0,content:e.message,isTimedOut:!1})})),u.once("response",(()=>{clearTimeout(m),h=p(e.responseTimeout,"Socket timeout")})),void 0!==e.data&&u.write(e.data),u.end()})),destroy:()=>(i.destroy(),c.destroy(),Promise.resolve())}}})),qe=i($),Te=u,ke=p,Re=V,Ee=xe,Ne=we,Ce=qe,Ue=i(j);const _e=e=>(t,r)=>{const s=t.map((e=>({...e,threshold:e.threshold||0})));return e.transporter.read({method:Ue.MethodEnum.Post,path:"1/indexes/*/recommendations",data:{requests:s},cacheable:!0},r)},Fe=e=>(t,r)=>_e(e)(t.map((e=>({...e,fallbackParameters:{},model:"bought-together"}))),r),ze=e=>(t,r)=>_e(e)(t.map((e=>({...e,model:"related-products"}))),r),Me=e=>(t,r)=>{const s=t.map((e=>({...e,model:"trending-facets",threshold:e.threshold||0})));return e.transporter.read({method:Ue.MethodEnum.Post,path:"1/indexes/*/recommendations",data:{requests:s},cacheable:!0},r)},Ge=e=>(t,r)=>{const s=t.map((e=>({...e,model:"trending-items",threshold:e.threshold||0})));return e.transporter.read({method:Ue.MethodEnum.Post,path:"1/indexes/*/recommendations",data:{requests:s},cacheable:!0},r)},Be=e=>(t,r)=>_e(e)(t.map((e=>({...e,model:"looking-similar"}))),r),Ke=e=>(t,r)=>{const s=t.map((e=>({...e,model:"recommended-for-you",threshold:e.threshold||0})));return e.transporter.read({method:Ue.MethodEnum.Post,path:"1/indexes/*/recommendations",data:{requests:s},cacheable:!0},r)};function $e(e,t,r){return(e=>{const t=e.appId,r=Re.createAuth(void 0!==e.authMode?e.authMode:Re.AuthMode.WithinHeaders,t,e.apiKey),s=Ce.createTransporter({hosts:[{url:`${t}-dsn.algolia.net`,accept:Ce.CallEnum.Read},{url:`${t}.algolia.net`,accept:Ce.CallEnum.Write}].concat(Re.shuffle([{url:`${t}-1.algolianet.com`},{url:`${t}-2.algolianet.com`},{url:`${t}-3.algolianet.com`}])),...e,headers:{...r.headers(),"content-type":"application/x-www-form-urlencoded",...e.headers},queryParameters:{...r.queryParameters(),...e.queryParameters}}),a={transporter:s,appId:t,addAlgoliaAgent(e,t){s.userAgent.add({segment:e,version:t})},clearCache:()=>Promise.all([s.requestsCache.clear(),s.responsesCache.clear()]).then((()=>{}))};return Re.addMethods(a,e.methods)})({...{appId:e,apiKey:t,timeouts:{connect:2,read:5,write:30},requester:Ne.createNodeHttpRequester(),logger:Ee.createNullLogger(),responsesCache:Te.createNullCache(),requestsCache:Te.createNullCache(),hostsCache:ke.createInMemoryCache(),userAgent:Ce.createUserAgent(Re.version).add({segment:"Recommend",version:Re.version}).add({segment:"Node.js",version:process.versions.node})},...r,methods:{destroy:Re.destroy,getFrequentlyBoughtTogether:Fe,getRecommendations:_e,getRelatedProducts:ze,getTrendingFacets:Me,getTrendingItems:Ge,getLookingSimilar:Be,getRecommendedForYou:Ke}})}$e.version=Re.version,$e.getFrequentlyBoughtTogether=Fe,$e.getRecommendations=_e,$e.getRelatedProducts=ze,$e.getTrendingFacets=Me,$e.getTrendingItems=Ge,$e.getLookingSimilar=Be,$e.getRecommendedForYou=Ke;const Le=$e;Ae.exports=Le,Ae.exports.default=Le;var He=Ae.exports,Ve=u,We=p,Qe=H,Je=V,Ye=Q,Xe=je,Ze=xe,et=He,tt=we,rt=qe;function st(e,t,r){const s={appId:e,apiKey:t,timeouts:{connect:2,read:5,write:30},requester:tt.createNodeHttpRequester(),logger:Ze.createNullLogger(),responsesCache:Ve.createNullCache(),requestsCache:Ve.createNullCache(),hostsCache:We.createInMemoryCache(),userAgent:rt.createUserAgent(Je.version).add({segment:"Node.js",version:process.versions.node})},a={...s,...r},o=()=>e=>Ye.createPersonalizationClient({...s,...e,methods:{getPersonalizationStrategy:Ye.getPersonalizationStrategy,setPersonalizationStrategy:Ye.setPersonalizationStrategy}});return Xe.createSearchClient({...a,methods:{search:Xe.multipleQueries,searchForFacetValues:Xe.multipleSearchForFacetValues,multipleBatch:Xe.multipleBatch,multipleGetObjects:Xe.multipleGetObjects,multipleQueries:Xe.multipleQueries,copyIndex:Xe.copyIndex,copySettings:Xe.copySettings,copyRules:Xe.copyRules,copySynonyms:Xe.copySynonyms,moveIndex:Xe.moveIndex,listIndices:Xe.listIndices,getLogs:Xe.getLogs,listClusters:Xe.listClusters,multipleSearchForFacetValues:Xe.multipleSearchForFacetValues,getApiKey:Xe.getApiKey,addApiKey:Xe.addApiKey,listApiKeys:Xe.listApiKeys,updateApiKey:Xe.updateApiKey,deleteApiKey:Xe.deleteApiKey,restoreApiKey:Xe.restoreApiKey,assignUserID:Xe.assignUserID,assignUserIDs:Xe.assignUserIDs,getUserID:Xe.getUserID,searchUserIDs:Xe.searchUserIDs,listUserIDs:Xe.listUserIDs,getTopUserIDs:Xe.getTopUserIDs,removeUserID:Xe.removeUserID,hasPendingMappings:Xe.hasPendingMappings,generateSecuredApiKey:Xe.generateSecuredApiKey,getSecuredApiKeyRemainingValidity:Xe.getSecuredApiKeyRemainingValidity,destroy:Je.destroy,clearDictionaryEntries:Xe.clearDictionaryEntries,deleteDictionaryEntries:Xe.deleteDictionaryEntries,getDictionarySettings:Xe.getDictionarySettings,getAppTask:Xe.getAppTask,replaceDictionaryEntries:Xe.replaceDictionaryEntries,saveDictionaryEntries:Xe.saveDictionaryEntries,searchDictionaryEntries:Xe.searchDictionaryEntries,setDictionarySettings:Xe.setDictionarySettings,waitAppTask:Xe.waitAppTask,customRequest:Xe.customRequest,initIndex:e=>t=>Xe.initIndex(e)(t,{methods:{batch:Xe.batch,delete:Xe.deleteIndex,findAnswers:Xe.findAnswers,getObject:Xe.getObject,getObjects:Xe.getObjects,saveObject:Xe.saveObject,saveObjects:Xe.saveObjects,search:Xe.search,searchForFacetValues:Xe.searchForFacetValues,waitTask:Xe.waitTask,setSettings:Xe.setSettings,getSettings:Xe.getSettings,partialUpdateObject:Xe.partialUpdateObject,partialUpdateObjects:Xe.partialUpdateObjects,deleteObject:Xe.deleteObject,deleteObjects:Xe.deleteObjects,deleteBy:Xe.deleteBy,clearObjects:Xe.clearObjects,browseObjects:Xe.browseObjects,getObjectPosition:Xe.getObjectPosition,findObject:Xe.findObject,exists:Xe.exists,saveSynonym:Xe.saveSynonym,saveSynonyms:Xe.saveSynonyms,getSynonym:Xe.getSynonym,searchSynonyms:Xe.searchSynonyms,browseSynonyms:Xe.browseSynonyms,deleteSynonym:Xe.deleteSynonym,clearSynonyms:Xe.clearSynonyms,replaceAllObjects:Xe.replaceAllObjects,replaceAllSynonyms:Xe.replaceAllSynonyms,searchRules:Xe.searchRules,getRule:Xe.getRule,deleteRule:Xe.deleteRule,saveRule:Xe.saveRule,saveRules:Xe.saveRules,replaceAllRules:Xe.replaceAllRules,browseRules:Xe.browseRules,clearRules:Xe.clearRules}}),initAnalytics:()=>e=>Qe.createAnalyticsClient({...s,...e,methods:{addABTest:Qe.addABTest,getABTest:Qe.getABTest,getABTests:Qe.getABTests,stopABTest:Qe.stopABTest,deleteABTest:Qe.deleteABTest}}),initPersonalization:o,initRecommendation:()=>e=>(a.logger.info("The `initRecommendation` method is deprecated. Use `initPersonalization` instead."),o()(e)),getRecommendations:et.getRecommendations,getFrequentlyBoughtTogether:et.getFrequentlyBoughtTogether,getLookingSimilar:et.getLookingSimilar,getRecommendedForYou:et.getRecommendedForYou,getRelatedProducts:et.getRelatedProducts,getTrendingFacets:et.getTrendingFacets,getTrendingItems:et.getTrendingItems}})}st.version=Je.version;const at=st;c.exports=at,c.exports.default=at;var ot=n(c.exports),nt={id:"algolia",handler:(e,{services:t})=>{console.log("Algolia reindex extension is loading...");try{const{ItemsService:r}=t;console.log("ItemsService loaded successfully");const s=ot(process.env.ALGOLIA_APP_ID,process.env.ALGOLIA_ADMIN_API_KEY).initIndex(process.env.ALGOLIA_INDEX_NAME);console.log("Algolia client initialized with index:",process.env.ALGOLIA_INDEX_NAME);const a=e=>{console.log("Transforming property:",e.code);const t="string"==typeof e.officeIds?JSON.parse(e.officeIds):e.officeIds,r={DUR:"Durham",BAO:"Bishop Auckland",CLS:"Chester-le-Street",CNS:"Consett",DAR:"Darlington"},s=t?.find((e=>r[e]))?r[t.find((e=>r[e]))]:null,a=s&&e.area?.name?`${s} - ${e.area.name}`:e.area?.name||null;return{objectID:e.code,code:e.code,image:e.featuredImageUrl,imagecount:e.images?.length||0,address2:e.address?.line2,address3:e.address?.line3,postcode:e.address?.postcode,_geoloc:e.address?.geolocation?{lat:e.address.geolocation.latitude,lng:e.address.geolocation.longitude}:null,bedrooms:e.bedrooms,receptions:e.receptions,bathrooms:e.bathrooms,videourl:e.video2Url,type:Array.isArray(e.type)?e.type.toString():e.type,price:e.selling?.price||e.letting?.rent||null,qualifier:e.selling?.qualifier?e.selling.qualifier.replace(/([A-Z])/g," $1").trim():null,officeid:t?.[0]||null,mode:e.marketingMode,sellingstatus:e.selling?.status||null,lettingstatus:e.letting?.status||null,parent:s,area:a}};e.get("/",((e,t)=>{console.log("GET / route hit"),t.send("Algolia reindex endpoint is working")})),e.post("/reindex",(async(e,t)=>{if(console.log("POST /reindex route hit"),null==e.accountability?.user)return console.log("Unauthorized access attempt"),t.json({message:"Unauthorized access attempt",success:!1});try{let o=0,n="";console.log("Clearing existing index"),await s.clearObjects(),n="Index cleared";const i=100,c=new r("properties",{schema:e.schema});let l=0,d=!0;for(;d;){console.log(`Processing page ${l}`);const e=await c.readByQuery({limit:i,offset:l*i});if(0===e.length){d=!1;continue}const t=e.map(a);await s.saveObjects(t),o+=e.length,l++,n=`Processed ${o} properties`}return console.log("Reindex completed successfully"),t.json({message:`Reindex completed successfully. Processed ${o} properties.`,success:!0,total:o,lastStep:n})}catch(e){return console.error("Reindex error:",e),t.json({message:e.message||"Failed to update Algolia index",success:!1,error:!0})}})),console.log("Algolia reindex extension routes registered successfully")}catch(e){throw console.error("Error initializing Algolia reindex extension:",e),e}}};export{nt as default};
