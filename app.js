/* ============================================================
   TMDL Generator  |  app.js
   No-sidebar layout · dropdown-driven · 15 object types
   ============================================================ */

// ── Object type registry ──────────────────────────────────────
const OBJECT_TYPES = [
  {
    id:'model', label:'Model', icon:'📐', color:'#0EA5E9',
    badge:'#F0F9FF', badgeText:'#0369A1', desc:'Model-level configuration',
    group:'Model',
    fields:[
      {id:'culture',            label:'Culture',                      type:'select', options:['en-US','en-GB','fr-FR','de-DE','ja-JP','zh-CN','pt-BR','es-ES'], def:'en-US'},
      {id:'sourceQueryCulture', label:'Source Query Culture',         type:'select', options:['en-US','en-GB','fr-FR','de-DE','ja-JP','zh-CN','pt-BR','es-ES'], def:'en-US'},
      {id:'defaultMode',        label:'Default Mode',                 type:'select', options:['import','directQuery','dualMode','push','streaming'], def:'import'},
      {id:'discourageImplicit', label:'Discourage Implicit Measures', type:'toggle', def:true},
      {id:'desc',               label:'Description',                  type:'text',   placeholder:'Enterprise data model'},
    ],
    generate: v => buildModel(v),
  },
  {
    id:'table', label:'Table', icon:'📊', color:'#10B981',
    badge:'#ECFDF5', badgeText:'#065F46', desc:'Fact or dimension table',
    group:'Tables',
    fields:[
      {id:'tableName',   label:'Table Name',         type:'text',    placeholder:'Sales', required:true},
      {id:'sourceTable', label:'Source Table',        type:'text',    placeholder:'dbo.FactSales'},
      {id:'mode',        label:'Storage Mode',        type:'select',  options:['import','directQuery','dualMode','push']},
      {id:'server',      label:'Server Parameter',    type:'text',    placeholder:'Server'},
      {id:'database',    label:'Database Parameter',  type:'text',    placeholder:'Database'},
      {id:'isHidden',    label:'Hidden',              type:'toggle'},
      {id:'desc',        label:'Description',         type:'textarea',placeholder:'Contains transactional sales data'},
    ],
    generate: v => buildTable(v),
  },
  {
    id:'measure', label:'Measure', icon:'📏', color:'#F59E0B',
    badge:'#FFFBEB', badgeText:'#92400E', desc:'DAX calculated measure',
    group:'Tables',
    fields:[
      {id:'tableName',    label:'Parent Table',    type:'text',    placeholder:'Sales', required:true},
      {id:'measureName',  label:'Measure Name',    type:'text',    placeholder:'Sales Amount', required:true},
      {id:'expression',   label:'DAX Expression',  type:'textarea',placeholder:"SUMX('Sales', 'Sales'[Quantity] * 'Sales'[Net Price])", required:true},
      {id:'formatString', label:'Format String',   type:'select',  options:['$ #,##0','$ #,##0.00','#,##0','#,##0.00','0%','0.00%','dd/MM/yyyy','General','Custom...'], def:'$ #,##0'},
      {id:'customFormat', label:'Custom Format (if Custom selected)', type:'text', placeholder:'#,##0.00 "units"'},
      {id:'displayFolder',label:'Display Folder',  type:'text',    placeholder:'Key Measures'},
      {id:'isHidden',     label:'Hidden',          type:'toggle'},
      {id:'kpi',          label:'Add KPI Stub',    type:'toggle'},
      {id:'desc',         label:'Description',     type:'textarea',placeholder:'Total sales revenue'},
    ],
    generate: v => buildMeasure(v),
  },
  {
    id:'column', label:'Column', icon:'🏛️', color:'#14B8A6',
    badge:'#F0FDFA', badgeText:'#134E4A', desc:'Table column definition',
    group:'Tables',
    fields:[
      {id:'tableName',   label:'Parent Table',    type:'text',   placeholder:'Sales', required:true},
      {id:'colName',     label:'Column Name',     type:'text',   placeholder:'Product Key', required:true},
      {id:'sourceCol',   label:'Source Column',   type:'text',   placeholder:'ProductKey'},
      {id:'dataType',    label:'Data Type',       type:'select', options:['int64','string','double','decimal','dateTime','boolean','binary'], def:'string'},
      {id:'summarizeBy', label:'Summarize By',    type:'select', options:['none','sum','min','max','average','count','distinctCount'], def:'none'},
      {id:'formatString',label:'Format String',   type:'text',   placeholder:'$ #,##0'},
      {id:'sortByCol',   label:'Sort By Column',  type:'text',   placeholder:'Month Number'},
      {id:'displayFolder',label:'Display Folder', type:'text',   placeholder:'Keys'},
      {id:'isHidden',    label:'Hidden',          type:'toggle'},
      {id:'isKey',       label:'Is Key',          type:'toggle'},
      {id:'desc',        label:'Description',     type:'textarea',placeholder:'Foreign key to Product'},
    ],
    generate: v => buildColumn(v),
  },
  {
    id:'calc_column', label:'Calc. Column', icon:'🔢', color:'#8B5CF6',
    badge:'#F5F3FF', badgeText:'#5B21B6', desc:'DAX calculated column',
    group:'Tables',
    fields:[
      {id:'tableName',    label:'Parent Table',   type:'text',    placeholder:'Sales', required:true},
      {id:'colName',      label:'Column Name',    type:'text',    placeholder:'Profit Margin', required:true},
      {id:'expression',   label:'DAX Expression', type:'textarea',placeholder:"DIVIDE([Revenue] - [Cost], [Revenue])", required:true},
      {id:'dataType',     label:'Data Type',      type:'select',  options:['double','decimal','int64','string','boolean','dateTime'], def:'double'},
      {id:'formatString', label:'Format String',  type:'text',    placeholder:'0.00%'},
      {id:'displayFolder',label:'Display Folder', type:'text',    placeholder:'Financials'},
      {id:'isHidden',     label:'Hidden',         type:'toggle'},
      {id:'desc',         label:'Description',    type:'textarea',placeholder:'Calculated profit margin %'},
    ],
    generate: v => buildCalculatedColumn(v),
  },
  {
  {
    id:'date_table', label:'Date Table', icon:'📅', color:'#0891B2',
    badge:'#ECFEFF', badgeText:'#155E75', desc:'Calculated Date dimension table',
    group:'Tables',
    fields:[
      {id:'tableName',  label:'Table Name',          type:'text',   placeholder:'Date', required:true},
      {id:'startYear',  label:'Start Year',          type:'text',   placeholder:'2020'},
      {id:'endYear',    label:'End Year',            type:'text',   placeholder:'2030'},
      {id:'markAsDate', label:'Mark as Date Table',  type:'toggle', def:true},
      {id:'dateColName',label:'Date Column Name',    type:'text',   placeholder:'Date'},
      {id:'addHierarchy',label:'Add Date Hierarchy', type:'toggle', def:true},
      {id:'desc',       label:'Description',         type:'textarea',placeholder:'Standard date dimension'},
    ],
    generate: v => buildDateTable(v),
  },
  {
    id:'hierarchy', label:'Hierarchy', icon:'📈', color:'#F97316',
    badge:'#FFF7ED', badgeText:'#9A3412', desc:'User-defined hierarchy',
    group:'Tables',
    fields:[
      {id:'tableName',    label:'Parent Table',   type:'text',    placeholder:'Date', required:true},
      {id:'hierName',     label:'Hierarchy Name', type:'text',    placeholder:'Date Hierarchy', required:true},
      {id:'levels',       label:'Levels — one per line (column names)', type:'textarea', placeholder:'Year\nQuarter\nMonth\nDay', required:true},
      {id:'displayFolder',label:'Display Folder', type:'text',    placeholder:'Date'},
      {id:'isHidden',     label:'Hidden',         type:'toggle'},
      {id:'desc',         label:'Description',    type:'textarea',placeholder:'Standard date drill-down'},
    ],
    generate: v => buildHierarchy(v),
  },
  {
    id:'relationship', label:'Relationship', icon:'🔗', color:'#64748B',
    badge:'#F8FAFC', badgeText:'#1E293B', desc:'Table relationship',
    group:'Model',
    fields:[
      {id:'relId',       label:'Relationship GUID', type:'text',   placeholder:'auto-generated', hint:'Leave blank to auto-generate'},
      {id:'fromTable',   label:'From Table',        type:'text',   placeholder:'Sales', required:true},
      {id:'fromCol',     label:'From Column',       type:'text',   placeholder:'Product Key', required:true},
      {id:'toTable',     label:'To Table',          type:'text',   placeholder:'Product', required:true},
      {id:'toCol',       label:'To Column',         type:'text',   placeholder:'Product Key', required:true},
      {id:'cardinality', label:'Cardinality',       type:'select', options:['manyToOne','oneToOne','oneToMany','manyToMany'], def:'manyToOne'},
      {id:'crossFilter', label:'Cross Filter',      type:'select', options:['singleDirection','bothDirections','automatic'], def:'singleDirection'},
      {id:'isActive',    label:'Active',            type:'toggle', def:true},
    ],
    generate: v => buildRelationship(v),
  },
  {
    id:'role', label:'Role', icon:'🔒', color:'#DC2626',
    badge:'#FEF2F2', badgeText:'#991B1B', desc:'Security role with RLS',
    group:'Security',
    fields:[
      {id:'roleName',    label:'Role Name',         type:'text',    placeholder:'Region Managers', required:true},
      {id:'modelPerm',   label:'Model Permission',  type:'select',  options:['read','readRefresh','refresh','administrator'], def:'read'},
      {id:'filterTable', label:'Filter Table',      type:'text',    placeholder:'Store'},
      {id:'filterExpr',  label:'Row Filter (DAX)',  type:'textarea',placeholder:'[Region] = USERPRINCIPALNAME()'},
      {id:'desc',        label:'Description',       type:'textarea',placeholder:'Access restricted to regional data'},
    ],
    generate: v => buildRole(v),
  },
  {
    id:'expression', label:'Expression', icon:'📝', color:'#06B6D4',
    badge:'#ECFEFF', badgeText:'#164E63', desc:'Named M expression / parameter',
    group:'Model',
    fields:[
      {id:'exprName',    label:'Expression Name',    type:'text',   placeholder:'Databricks_Catalog', required:true},
      {id:'kind',        label:'Kind',               type:'select', options:['m','dax'], def:'m'},
      {id:'value',       label:'Value',              type:'text',   placeholder:'salesanalytics', required:true},
      {id:'isParam',     label:'Is Parameter Query', type:'toggle', def:true},
      {id:'paramType',   label:'Parameter Type',     type:'select', options:['Text','Number','Binary','Date','DateTime'], def:'Text'},
      {id:'queryGroup',  label:'Query Group',        type:'text',   placeholder:'dbks_Parameters'},
      {id:'navStepName', label:'PBI Navigation Step Name', type:'text', placeholder:'Navigation'},
      {id:'resultType',  label:'PBI Result Type',    type:'select', options:['Text','Number','Binary','Date','DateTime','Table','Record','List'], def:'Text'},
    ],
    generate: v => buildExpression(v),
  },
  {
    id:'calc_group', label:'Calc. Group', icon:'⚙️', color:'#7C3AED',
    badge:'#F5F3FF', badgeText:'#4C1D95', desc:'Calculation group & items',
    group:'Tables',
    fields:[
      {id:'tableName',  label:'Table Name',   type:'text',    placeholder:'Time Intelligence', required:true},
      {id:'precedence', label:'Precedence',   type:'text',    placeholder:'1'},
      {id:'items',      label:'Calc Items — Name | DAX Expression (one per line)', type:'textarea',
                        placeholder:"YTD | CALCULATE(SELECTEDMEASURE(), DATESYTD('Date'[Date]))\nMTD | CALCULATE(SELECTEDMEASURE(), DATESMTD('Date'[Date]))\nPY | CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR('Date'[Date]))", required:true},
      {id:'formatCol',  label:'Add Format String Column', type:'toggle'},
      {id:'desc',       label:'Description',  type:'textarea',placeholder:'Standard time intelligence'},
    ],
    generate: v => buildCalcGroup(v),
  },
  {
    id:'aggregation', label:'Aggregation', icon:'⚡', color:'#D97706',
    badge:'#FFFBEB', badgeText:'#78350F', desc:'Aggregation table mapping',
    group:'Model',
    fields:[
      {id:'aggTable',   label:'Aggregation Table Name',  type:'text', placeholder:'Sales_Agg', required:true},
      {id:'detailTable',label:'Detail Table Name',       type:'text', placeholder:'Sales', required:true},
      {id:'mappings',   label:'Column Mappings — AggCol | DetailCol | Summarization (one per line)',
                        type:'textarea',
                        placeholder:"SalesAmount | SalesAmount | sum\nQuantity | Quantity | sum\nCustomerKey | CustomerKey | groupBy\nProductKey | ProductKey | groupBy",
                        required:true},
      {id:'storageMode',label:'Storage Mode',            type:'select', options:['import','directQuery','dualMode'], def:'import'},
      {id:'desc',       label:'Description',             type:'textarea', placeholder:'Pre-aggregated summary table for performance'},
    ],
    generate: v => buildAggregation(v),
  },
  {
    id:'function', label:'Function', icon:'🧩', color:'#9333EA',
    badge:'#FAF5FF', badgeText:'#6B21A8', desc:'DAX User Defined Function (UDF)',
    group:'Model',
    fields:[
      {id:'funcName',   label:'Function Name',      type:'text',    placeholder:'AddTax', required:true},
      {id:'params',     label:'Parameters — Name:Type (comma separated)', type:'text', placeholder:"amount:NUMERIC"},
      {id:'returnType', label:'Return Data Type',   type:'select',  options:['boolean','double','decimal','int64','string','dateTime','NUMERIC','variant'], def:'double'},
      {id:'expression', label:'DAX Expression',     type:'textarea',placeholder:'amount * 1.1', required:true},
      {id:'desc',       label:'Description',        type:'textarea',placeholder:'AddTax takes in amount and returns amount including tax'},
    ],
    generate: v => buildFunction(v),
  },
  {
    id:'culture', label:'Culture', icon:'🌐', color:'#0284C7',
    badge:'#F0F9FF', badgeText:'#0C4A6E', desc:'Linguistic schema / culture',
    group:'Model',
    fields:[
      {id:'cultureName', label:'Culture Name',     type:'select', options:['en-US','en-GB','fr-FR','de-DE','nl-NL','es-ES','pt-BR','pt-PT','it-IT','ja-JP','zh-CN','zh-TW','ko-KR','ar-SA','ru-RU'], def:'en-US'},
      {id:'customCulture',label:'Custom Culture (override)', type:'text', placeholder:'sw-KE'},
      {id:'synonyms',    label:'Synonyms — ObjectType.ObjectName:Synonym1,Synonym2 (one per line)', type:'textarea',
                         placeholder:"measure.'Sales Amount':revenue,total sales\ntable.Sales:transactions,orders"},
      {id:'desc',        label:'Description',      type:'textarea', placeholder:'English (US) linguistic schema'},
    ],
    generate: v => buildCulture(v),
  },
  {
    id:'perspective', label:'Perspective', icon:'🔭', color:'#0891B2',
    badge:'#ECFEFF', badgeText:'#164E63', desc:'Model perspective / subset view',
    group:'Model',
    fields:[
      {id:'perspName',  label:'Perspective Name',  type:'text',    placeholder:'Finance View', required:true},
      {id:'tables',     label:'Tables to include (one per line)', type:'textarea', placeholder:'Sales\nProduct\nDate\nCustomer', required:true},
      {id:'measures',   label:'Measures — Table.MeasureName (one per line)', type:'textarea', placeholder:"Sales.'Sales Amount'\nSales.'Total Quantity'"},
      {id:'columns',    label:'Columns — Table.Column (one per line)', type:'textarea', placeholder:"Product.'Product Name'\nDate.Year"},
      {id:'desc',       label:'Description',       type:'textarea', placeholder:'Finance-focused view of the model'},
    ],
    generate: v => buildPerspective(v),
  },
];

// ── TMDL Helpers ──────────────────────────────────────────────
function q(n){if(!n)return"''";return/[\s.=:']/.test(n)?`'${n.replace(/'/g,"''")}'`:n}
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function uuidv4(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16)})}
function stripHTML(h){const d=document.createElement('div');d.innerHTML=h;return d.textContent||d.innerText||''}

// ── TMDL Builders ─────────────────────────────────────────────
function buildModel(v){
  let o=`<span class="tk-kw">model</span> <span class="tk-obj">Model</span>\n`;
  o+=`    <span class="tk-prop">culture</span><span class="tk-eq">:</span> <span class="tk-str">${v.culture||'en-US'}</span>\n`;
  o+=`    <span class="tk-prop">defaultPowerBIDataSourceVersion</span><span class="tk-eq">:</span> <span class="tk-str">powerBI_V3</span>\n`;
  if(v.discourageImplicit!==false&&v.discourageImplicit!=='false')o+=`    <span class="tk-prop">discourageImplicitMeasures</span>\n`;
  if(v.defaultMode&&v.defaultMode!=='import')o+=`    <span class="tk-prop">defaultMode</span><span class="tk-eq">:</span> <span class="tk-str">${v.defaultMode}</span>\n`;
  o+=`    <span class="tk-prop">sourceQueryCulture</span><span class="tk-eq">:</span> <span class="tk-str">${v.sourceQueryCulture||'en-US'}</span>\n`;
  if(v.desc)o+=`\n    <span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  return o.trimEnd();
}
function buildTable(v){
  const tName=v.tableName||'TableName';
  const pName=tName.replace(/\s+/g,'')+'-Partition';
  const src=v.sourceTable||'dbo.FactTable';
  const srv=v.server||'Server';const db=v.database||'Database';
  const p=src.split('.');const schm=p.length>1?p[0]:'dbo';const tbl=p.length>1?p[1]:src;
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n`;
  if(v.isHidden)o+=`    <span class="tk-prop">isHidden</span>\n`;
  o+=`    <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  o+=`\n    <span class="tk-kw">partition</span> <span class="tk-obj">${esc(q(pName))}</span> <span class="tk-eq">=</span> <span class="tk-str">m</span>\n`;
  o+=`        <span class="tk-prop">mode</span><span class="tk-eq">:</span> <span class="tk-str">${v.mode||'import'}</span>\n`;
  o+=`        <span class="tk-prop">source</span> <span class="tk-eq">=</span>\n`;
  o+=`            <span class="tk-dax">let\n                Source = Sql.Database(${esc(srv)}, ${esc(db)}),\n                Navigation = Source{[Schema="${esc(schm)}",Item="${esc(tbl)}"]}[Data]\n            in\n                Navigation</span>\n`;
  o+=`\n    <span class="tk-cmt">/// Add columns and measures below</span>\n`;
  return o.trimEnd();
}
function buildMeasure(v){
  const tName=v.tableName||'Sales';const mName=v.measureName||'Measure';
  const expr=(v.expression||"SUMX('Sales',[Quantity]*[Price])").trim();
  const fmt=v.formatString==='Custom...'?(v.customFormat||'#,##0'):(v.formatString||'$ #,##0');
  const isML=expr.includes('\n')||expr.length>60;
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n\n`;
  if(isML){
    o+=`    <span class="tk-kw">measure</span> <span class="tk-obj">${esc(q(mName))}</span> <span class="tk-eq">=</span>\n`;
    o+=expr.split('\n').map(l=>`            <span class="tk-dax">${esc(l)}</span>`).join('\n')+'\n';
  }else{
    o+=`    <span class="tk-kw">measure</span> <span class="tk-obj">${esc(q(mName))}</span> <span class="tk-eq">=</span> <span class="tk-dax">${esc(expr)}</span>\n`;
  }
  o+=`        <span class="tk-prop">formatString</span><span class="tk-eq">:</span> <span class="tk-str">${esc(fmt)}</span>\n`;
  if(v.displayFolder)o+=`        <span class="tk-prop">displayFolder</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.displayFolder)}</span>\n`;
  if(v.isHidden)o+=`        <span class="tk-prop">isHidden</span>\n`;
  o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  if(v.kpi){
    o+=`\n        <span class="tk-kw">kpi</span>\n`;
    o+=`            <span class="tk-prop">targetExpression</span><span class="tk-eq">:</span> <span class="tk-str">1000000</span>\n`;
    o+=`            <span class="tk-prop">statusGraphic</span><span class="tk-eq">:</span> <span class="tk-str">"Traffic Light - Single"</span>\n`;
    o+=`            <span class="tk-prop">statusExpression</span> <span class="tk-eq">=</span>\n`;
    o+=`                    <span class="tk-dax">var goal = KPI.Goal\nvar value = KPI.Value\nreturn IF(ISBLANK(value), BLANK(), IF(value >= goal, 1, IF(value >= goal * 0.85, 0, -1)))</span>\n`;
  }
  return o.trimEnd();
}
function buildColumn(v){
  const tName=v.tableName||'Sales';const cName=v.colName||'Column';
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n\n`;
  o+=`    <span class="tk-kw">column</span> <span class="tk-obj">${esc(q(cName))}</span>\n`;
  o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">${v.dataType||'string'}</span>\n`;
  if(v.sourceCol)o+=`        <span class="tk-prop">sourceColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.sourceCol)}</span>\n`;
  o+=`        <span class="tk-prop">summarizeBy</span><span class="tk-eq">:</span> <span class="tk-str">${v.summarizeBy||'none'}</span>\n`;
  if(v.formatString)o+=`        <span class="tk-prop">formatString</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.formatString)}</span>\n`;
  if(v.sortByCol)o+=`        <span class="tk-prop">sortByColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(v.sortByCol))}</span>\n`;
  if(v.displayFolder)o+=`        <span class="tk-prop">displayFolder</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.displayFolder)}</span>\n`;
  if(v.isHidden)o+=`        <span class="tk-prop">isHidden</span>\n`;
  if(v.isKey)o+=`        <span class="tk-prop">isKey</span>\n`;
  o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  o+=`\n        <span class="tk-prop">annotation</span> <span class="tk-obj">SummarizationSetBy</span> <span class="tk-eq">=</span> <span class="tk-str">Automatic</span>\n`;
  return o.trimEnd();
}
function buildCalculatedColumn(v){
  const tName=v.tableName||'Sales';const cName=v.colName||'Calc Column';
  const expr=(v.expression||'BLANK()').trim();const isML=expr.includes('\n')||expr.length>60;
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n\n`;
  if(isML){
    o+=`    <span class="tk-kw">calculatedColumn</span> <span class="tk-obj">${esc(q(cName))}</span> <span class="tk-eq">=</span>\n`;
    o+=expr.split('\n').map(l=>`            <span class="tk-dax">${esc(l)}</span>`).join('\n')+'\n';
  }else{
    o+=`    <span class="tk-kw">calculatedColumn</span> <span class="tk-obj">${esc(q(cName))}</span> <span class="tk-eq">=</span> <span class="tk-dax">${esc(expr)}</span>\n`;
  }
  o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">${v.dataType||'double'}</span>\n`;
  if(v.formatString)o+=`        <span class="tk-prop">formatString</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.formatString)}</span>\n`;
  if(v.displayFolder)o+=`        <span class="tk-prop">displayFolder</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.displayFolder)}</span>\n`;
  if(v.isHidden)o+=`        <span class="tk-prop">isHidden</span>\n`;
  o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  return o.trimEnd();
}
function buildDateTable(v){
  const tName=v.tableName||'Date';
  const dateCol=v.dateColName||'Date';
  const startY=v.startYear||'2020';
  const endY=v.endYear||'2030';
  const markDate=v.markAsDate!==false&&v.markAsDate!=='false';
  const addHier=v.addHierarchy!==false&&v.addHierarchy!=='false';
  const ltBase=uuidv4();
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n`;
  if(markDate)o+=`    <span class="tk-prop">isDateTable</span>\n`;
  o+=`    <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${ltBase}</span>\n`;
  // Core date columns
  const cols=[
    {n:dateCol,       dt:'dateTime', src:dateCol,       summ:'none',  fmt:'dd/MM/yyyy'},
    {n:'Year',        dt:'int64',    src:'Year',        summ:'none'},
    {n:'YearMonth',   dt:'string',   src:'YearMonth',   summ:'none'},
    {n:'Quarter',     dt:'string',   src:'Quarter',     summ:'none'},
    {n:'QuarterNo',   dt:'int64',    src:'QuarterNo',   summ:'none'},
    {n:'Month',       dt:'string',   src:'Month',       summ:'none'},
    {n:'MonthNo',     dt:'int64',    src:'MonthNo',     summ:'none'},
    {n:'Day',         dt:'int64',    src:'Day',         summ:'none'},
    {n:'Weekday',     dt:'string',   src:'Weekday',     summ:'none'},
    {n:'IsWeekend',   dt:'boolean',  src:'IsWeekend',   summ:'none'},
    {n:'IsCurrentYear',dt:'boolean', src:'IsCurrentYear',summ:'none'},
  ];
  cols.forEach(c=>{
    o+=`\n    <span class="tk-kw">column</span> <span class="tk-obj">${esc(q(c.n))}</span>\n`;
    o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">${c.dt}</span>\n`;
    if(c.fmt)o+=`        <span class="tk-prop">formatString</span><span class="tk-eq">:</span> <span class="tk-str">${c.fmt}</span>\n`;
    o+=`        <span class="tk-prop">summarizeBy</span><span class="tk-eq">:</span> <span class="tk-str">${c.summ}</span>\n`;
    o+=`        <span class="tk-prop">sourceColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(c.src)}</span>\n`;
    o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
    o+=`\n        <span class="tk-prop">annotation</span> <span class="tk-obj">SummarizationSetBy</span> <span class="tk-eq">=</span> <span class="tk-str">Automatic</span>\n`;
  });
  // Mark date col sort
  o+=`\n    <span class="tk-cmt">/// Sort Month by MonthNo, Weekday by WeekdayNo</span>\n`;
  // Date hierarchy
  if(addHier){
    o+=`\n    <span class="tk-kw">hierarchy</span> <span class="tk-obj">'Date Hierarchy'</span>\n`;
    o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
    [{n:'Year',c:'Year'},{n:'Quarter',c:'Quarter'},{n:'Month',c:'Month'},{n:'Day',c:'Day'}].forEach((lv,i)=>{
      o+=`\n        <span class="tk-kw">level</span> <span class="tk-obj">${lv.n}</span>\n`;
      o+=`            <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${i}</span>\n`;
      o+=`            <span class="tk-prop">column</span><span class="tk-eq">:</span> <span class="tk-str">${lv.c}</span>\n`;
      o+=`            <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
    });
  }
  // Partition
  o+=`\n    <span class="tk-kw">partition</span> <span class="tk-obj">${esc(q(tName))}</span> <span class="tk-eq">=</span> <span class="tk-str">calculated</span>\n`;
  o+=`        <span class="tk-prop">mode</span><span class="tk-eq">:</span> <span class="tk-str">import</span>\n`;
  o+=`        <span class="tk-prop">source</span> <span class="tk-eq">=</span>\n`;
  o+=`            <span class="tk-dax">CALENDAR(DATE(${startY},1,1), DATE(${endY},12,31))</span>\n`;
  return o.trimEnd();
}
function buildHierarchy(v){
  const tName=v.tableName||'Date';const hName=v.hierName||'Date Hierarchy';
  const levels=(v.levels||'Year\nQuarter\nMonth\nDay').split('\n').filter(l=>l.trim());
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n\n`;
  o+=`    <span class="tk-kw">hierarchy</span> <span class="tk-obj">${esc(q(hName))}</span>\n`;
  if(v.displayFolder)o+=`        <span class="tk-prop">displayFolder</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.displayFolder)}</span>\n`;
  if(v.isHidden)o+=`        <span class="tk-prop">isHidden</span>\n`;
  o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  levels.forEach((lv,i)=>{
    const c=lv.trim();
    o+=`\n        <span class="tk-kw">level</span> <span class="tk-obj">${esc(q(c))}</span>\n`;
    o+=`            <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${i}</span>\n`;
    o+=`            <span class="tk-prop">column</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(c))}</span>\n`;
    o+=`            <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  });
  return o.trimEnd();
}
function buildRelationship(v){
  const guid=v.relId&&v.relId.trim()?v.relId.trim():uuidv4();
  let o=`<span class="tk-kw">relationship</span> <span class="tk-obj">${esc(guid)}</span>\n`;
  o+=`    <span class="tk-prop">fromColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(v.fromTable||'Sales'))}.${esc(q(v.fromCol||'Key'))}</span>\n`;
  o+=`    <span class="tk-prop">toColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(v.toTable||'Product'))}.${esc(q(v.toCol||'Key'))}</span>\n`;
  if(v.cardinality&&v.cardinality!=='manyToOne')o+=`    <span class="tk-prop">fromCardinality</span><span class="tk-eq">:</span> <span class="tk-str">${v.cardinality}</span>\n`;
  if(v.crossFilter&&v.crossFilter!=='singleDirection')o+=`    <span class="tk-prop">crossFilteringBehavior</span><span class="tk-eq">:</span> <span class="tk-str">${v.crossFilter}</span>\n`;
  if(v.isActive===false||v.isActive==='false')o+=`    <span class="tk-prop">isActive</span><span class="tk-eq">:</span> <span class="tk-str">false</span>\n`;
  return o.trimEnd();
}
function buildRole(v){
  const rName=v.roleName||'Role';
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">role</span> <span class="tk-obj">${esc(q(rName))}</span>\n`;
  o+=`    <span class="tk-prop">modelPermission</span><span class="tk-eq">:</span> <span class="tk-str">${v.modelPerm||'read'}</span>\n`;
  if(v.filterTable&&v.filterExpr){
    o+=`\n    <span class="tk-kw">tablePermission</span> <span class="tk-obj">${esc(q(v.filterTable))}</span> <span class="tk-eq">=</span> <span class="tk-dax">${esc(v.filterExpr.trim())}</span>\n`;
  }
  return o.trimEnd();
}
function buildExpression(v){
  const eName=v.exprName||'Databricks_Catalog';const kind=v.kind||'m';
  const val=v.value||'salesanalytics';const type=v.paramType||'Text';
  const isParam=v.isParam!==false&&v.isParam!=='false';
  let meta=isParam&&kind==='m'?` meta [IsParameterQuery=true, Type="${type}", IsParameterQueryRequired=true]`:'';
  let o=`<span class="tk-kw">expression</span> <span class="tk-obj">${esc(q(eName))}</span> <span class="tk-eq">=</span> <span class="tk-dax">"${esc(val)}"${meta}</span>\n`;
  o+=`    <span class="tk-prop">kind</span><span class="tk-eq">:</span> <span class="tk-str">${kind}</span>\n`;
  o+=`    <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  if(v.queryGroup)o+=`    <span class="tk-prop">queryGroup</span><span class="tk-eq">:</span> <span class="tk-str">${esc(v.queryGroup)}</span>\n`;
  const navStep=v.navStepName||'Navigation';
  const resType=v.resultType||'Text';
  o+=`\n    <span class="tk-prop">annotation</span> <span class="tk-obj">PBI_NavigationStepName</span> <span class="tk-eq">=</span> <span class="tk-str">${esc(navStep)}</span>\n`;
  o+=`\n    <span class="tk-prop">annotation</span> <span class="tk-obj">PBI_ResultType</span> <span class="tk-eq">=</span> <span class="tk-str">${esc(resType)}</span>\n`;
  return o.trimEnd();
}
function buildCalcGroup(v){
  const tName=v.tableName||'Time Intelligence';const prec=v.precedence||'1';
  const rawItems=(v.items||"YTD | TOTALYTD([Sales Amount], 'Date'[Date])").split('\n');
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">calculationGroup</span> <span class="tk-obj">${esc(q(tName))}</span>\n`;
  o+=`    <span class="tk-prop">precedence</span><span class="tk-eq">:</span> <span class="tk-num">${prec}</span>\n`;
  if(v.formatCol){
    o+=`\n    <span class="tk-kw">column</span> <span class="tk-obj">Name</span>\n`;
    o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">string</span>\n`;
    o+=`        <span class="tk-prop">sourceColumn</span><span class="tk-eq">:</span> <span class="tk-str">Name</span>\n`;
    o+=`        <span class="tk-prop">summarizeBy</span><span class="tk-eq">:</span> <span class="tk-str">none</span>\n`;
    o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  }
  rawItems.forEach((item,idx)=>{
    const parts=item.split('|');if(parts.length<2)return;
    const iName=parts[0].trim();const iExpr=parts.slice(1).join('|').trim();
    const isML=iExpr.includes('\n')||iExpr.length>60;
    o+=`\n    <span class="tk-kw">calculationItem</span> <span class="tk-obj">${esc(q(iName))}</span>`;
    if(isML){o+=` <span class="tk-eq">=</span>\n`+iExpr.split('\n').map(l=>`            <span class="tk-dax">${esc(l)}</span>`).join('\n')+'\n';}
    else{o+=` <span class="tk-eq">=</span> <span class="tk-dax">${esc(iExpr)}</span>\n`;}
    o+=`        <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${idx}</span>\n`;
    o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  });
  return o.trimEnd();
}
function buildAggregation(v){
  const aggTable=v.aggTable||'Sales_Agg';const detailTable=v.detailTable||'Sales';
  const mode=v.storageMode||'import';
  const mappings=(v.mappings||'SalesAmount | SalesAmount | sum\nCustomerKey | CustomerKey | groupBy').split('\n').filter(l=>l.trim());
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(aggTable))}</span>\n`;
  o+=`    <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  o+=`\n    <span class="tk-kw">partition</span> <span class="tk-obj">${esc(q(aggTable+'-Partition'))}</span> <span class="tk-eq">=</span> <span class="tk-str">m</span>\n`;
  o+=`        <span class="tk-prop">mode</span><span class="tk-eq">:</span> <span class="tk-str">${mode}</span>\n`;
  o+=`        <span class="tk-prop">source</span> <span class="tk-eq">=</span> <span class="tk-cmt">// M expression for aggregation table</span>\n`;
  o+=`\n    <span class="tk-cmt">// Aggregation column mappings</span>\n`;
  mappings.forEach(m=>{
    const p=m.split('|');if(p.length<3)return;
    const aggCol=p[0].trim();const detailCol=p[1].trim();const summ=p[2].trim();
    o+=`\n    <span class="tk-kw">column</span> <span class="tk-obj">${esc(q(aggCol))}</span>\n`;
    o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">int64</span>\n`;
    o+=`        <span class="tk-prop">summarizeBy</span><span class="tk-eq">:</span> <span class="tk-str">${esc(summ)}</span>\n`;
    o+=`        <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
    o+=`\n        <span class="tk-kw">alternateOf</span>\n`;
    o+=`            <span class="tk-prop">baseTable</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(detailTable))}</span>\n`;
    o+=`            <span class="tk-prop">baseColumn</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(detailCol))}</span>\n`;
    o+=`            <span class="tk-prop">summarization</span><span class="tk-eq">:</span> <span class="tk-str">${esc(summ)}</span>\n`;
  });
  return o.trimEnd();
}
function buildFunction(v){
  const fn=v.funcName||'AddTax';
  const expr=(v.expression||'amount * 1.1').trim();
  const retType=v.returnType||'double';
  const params=(v.params||'').split(',').map(p=>p.trim()).filter(Boolean);
  const isML=expr.includes('\n')||expr.length>60;
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  if(params.length){
    o+=`<span class="tk-kw">function</span> <span class="tk-obj">${esc(q(fn))}</span> = (\n`;
    params.forEach((p,i)=>{
      const parts=p.split(':');const pn=parts[0].trim();const pt=parts[1]?parts[1].trim():'NUMERIC';
      const comma=i<params.length-1?',':'';
      o+=`        <span class="tk-dax">${esc(pn)} : ${esc(pt)}${comma}</span>\n`;
    });
    o+=`    ) =>\n`;
  }else{
    o+=`<span class="tk-kw">function</span> <span class="tk-obj">${esc(q(fn))}</span> <span class="tk-eq">=</span>`;
  }
  if(params.length||isML){
    o+=expr.split('\n').map(l=>`    <span class="tk-dax">${esc(l)}</span>`).join('\n')+'\n';
  }else{
    o+=` <span class="tk-dax">${esc(expr)}</span>\n`;
  }
  o+=`    <span class="tk-prop">returnType</span><span class="tk-eq">:</span> <span class="tk-str">${retType}</span>\n`;
  o+=`    <span class="tk-prop">lineageTag</span><span class="tk-eq">:</span> <span class="tk-str">${uuidv4()}</span>\n`;
  return o.trimEnd();
}
function buildCulture(v){
  const cName=v.customCulture&&v.customCulture.trim()?v.customCulture.trim():(v.cultureName||'en-US');
  const synonymLines=(v.synonyms||'').split('\n').filter(l=>l.trim());
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">culture</span> <span class="tk-obj">${esc(cName)}</span>\n\n`;
  o+=`    <span class="tk-kw">linguisticMetadata</span>\n`;
  o+=`        <span class="tk-prop">content</span> <span class="tk-eq">=</span> <span class="tk-str">json</span>\n`;
  o+=`            <span class="tk-dax">{\n              "Version": "1.0.0",\n              "Language": "${esc(cName)}",\n              "Entities": [\n`;
  if(synonymLines.length){
    const parsed={};
    synonymLines.forEach(line=>{
      const colonIdx=line.indexOf(':');if(colonIdx<0)return;
      const objPath=line.slice(0,colonIdx).trim();const syns=line.slice(colonIdx+1).split(',').map(s=>s.trim());
      const parts=objPath.split('.');
      const type=parts[0];const name=parts.length>1?parts[1]:parts[0];
      if(!parsed[name])parsed[name]={type,name,syns:[]};
      parsed[name].syns.push(...syns);
    });
    const entities=Object.values(parsed).map(e=>{
      return `                {\n                  "Name": "${esc(e.name)}",\n                  "Synonyms": [${e.syns.map(s=>`"${esc(s)}"`).join(', ')}]\n                }`;
    }).join(',\n');
    o+=entities+'\n';
  }
  o+=`              ]\n            }</span>\n`;
  return o.trimEnd();
}
function buildPerspective(v){
  const pName=v.perspName||'Perspective';
  const tables=(v.tables||'').split('\n').filter(l=>l.trim());
  const measures=(v.measures||'').split('\n').filter(l=>l.trim());
  const columns=(v.columns||'').split('\n').filter(l=>l.trim());
  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">perspective</span> <span class="tk-obj">${esc(q(pName))}</span>\n`;
  tables.forEach(t=>{
    const tName=t.trim();
    o+=`\n    <span class="tk-kw">perspectiveTable</span> <span class="tk-obj">${esc(q(tName))}</span>\n`;
    const tMeasures=measures.filter(m=>{const p=m.split('.');return p.length>1&&p[0].replace(/'/g,'').trim()===tName.replace(/'/g,'').trim();});
    tMeasures.forEach(m=>{
      const p=m.split('.');const mName=p.slice(1).join('.').trim();
      o+=`\n        <span class="tk-kw">perspectiveMeasure</span> <span class="tk-obj">${esc(q(mName))}</span>\n`;
    });
    const tCols=columns.filter(c=>{const p=c.split('.');return p.length>1&&p[0].replace(/'/g,'').trim()===tName.replace(/'/g,'').trim();});
    tCols.forEach(c=>{
      const p=c.split('.');const cName=p.slice(1).join('.').trim();
      o+=`\n        <span class="tk-kw">perspectiveColumn</span> <span class="tk-obj">${esc(q(cName))}</span>\n`;
    });
  });
  return o.trimEnd();
}

// ── State ──────────────────────────────────────────────────────
let tabs = [];
let activeTabId = null;

// ── Tab management ─────────────────────────────────────────────
function createTab(typeId, label){
  const type = OBJECT_TYPES.find(o=>o.id===typeId);
  if(!type)return null;
  const id = 'tab_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const tab = {id, typeId, label:label||type.label, values:{}};
  type.fields.forEach(f=>{
    if(f.def!==undefined) tab.values[f.id]=f.def;
    else if(f.type==='toggle') tab.values[f.id]=false;
    else tab.values[f.id]='';
  });
  tabs.push(tab);
  activeTabId=id;
  renderTabs();
  renderCanvas();
  return id;
}
function closeTab(id){
  const idx=tabs.findIndex(t=>t.id===id);
  tabs.splice(idx,1);
  if(activeTabId===id) activeTabId=tabs.length?tabs[Math.max(0,idx-1)].id:null;
  renderTabs();
  renderCanvas();
}
function switchTab(id){
  activeTabId=id;
  renderTabs();
  renderCanvas();
}

// ── Render tabs in header ─────────────────────────────────────
function renderTabs(){
  const list=document.getElementById('tabsList');
  list.innerHTML=tabs.map(tab=>{
    const type=OBJECT_TYPES.find(o=>o.id===tab.typeId)||{};
    return `<div class="tab-item ${tab.id===activeTabId?'active':''}" onclick="switchTab('${tab.id}')">
      <div class="tab-dot" style="background:${type.color||'#ccc'}"></div>
      <span class="tab-label">${esc(tab.label)}</span>
      <span class="tab-close" onclick="event.stopPropagation();closeTab('${tab.id}')">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </span>
    </div>`;
  }).join('');
}

// ── Render main canvas ─────────────────────────────────────────
function renderCanvas(){
  const canvas=document.getElementById('canvas');
  if(!tabs.length||!activeTabId){
    canvas.innerHTML=renderWelcome();
    return;
  }
  const tab=tabs.find(t=>t.id===activeTabId);
  if(!tab){canvas.innerHTML=renderWelcome();return;}
  const type=OBJECT_TYPES.find(o=>o.id===tab.typeId);
  canvas.innerHTML=renderSplitPane(tab,type);
  updateCodePreview(tab,type);
}

// ── Welcome screen ────────────────────────────────────────────
function renderWelcome(){
  // Group types by group
  const groups={};
  OBJECT_TYPES.forEach(t=>{const g=t.group||'Other';if(!groups[g])groups[g]=[];groups[g].push(t);});
  let html=`<div class="welcome-screen">
    <div class="welcome-icon">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#E85D26" stroke-width="1.7">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/>
      </svg>
    </div>
    <div>
      <div class="welcome-title">TMDL Generator</div>
      <div class="welcome-sub">Select an object type below to start generating production-ready TMDL templates. Fill in the properties and the script updates live.</div>
    </div>
    <div style="width:100%;max-width:860px;display:flex;flex-direction:column;gap:18px">`;
  Object.entries(groups).forEach(([group,items])=>{
    html+=`<div>
      <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ta-muted);margin-bottom:10px;padding-left:2px">${group}</div>
      <div class="welcome-grid">`;
    items.forEach(obj=>{
      html+=`<div class="welcome-card" onclick="createTab('${obj.id}',null)">
        <div class="wc-icon">${obj.icon}</div>
        <div class="wc-name">${obj.label}</div>
        <div class="wc-desc">${obj.desc}</div>
      </div>`;
    });
    html+=`</div></div>`;
  });
  html+=`</div></div>`;
  return html;
}

// ── Split pane ────────────────────────────────────────────────
function renderSplitPane(tab,type){
  // Build object type dropdown options
  const options=OBJECT_TYPES.map(o=>`<option value="${o.id}" ${o.id===tab.typeId?'selected':''}>${o.icon} ${o.label}</option>`).join('');

  // Badge style
  const badgeStyle=`background:${type.badge};color:${type.badgeText}`;

  // Build fields
  const fieldsHtml=type.fields.map(f=>renderField(f,tab.values)).join('');

  return `<div class="split-pane" id="sp_${tab.id}">

    <!-- LEFT: dropdown + form -->
    <div class="left-panel">
      <div class="left-panel-top">

        <!-- Object type dropdown row -->
        <div class="obj-type-row">
          <span class="obj-type-label">Object Type</span>
          <div class="select-wrapper">
            <select class="obj-type-select" onchange="onTypeChange(this,'${tab.id}')">
              ${options}
            </select>
          </div>
          <span class="type-badge" style="${badgeStyle}" id="badge_${tab.id}">${type.icon} ${type.label}</span>
        </div>

        <!-- Tab name row -->
        <div class="tab-name-row">
          <input type="text" class="tab-name-input" value="${esc(tab.label)}"
            placeholder="Template name..." id="tabname_${tab.id}"
            oninput="onTabRename(this,'${tab.id}')" />
          <button class="btn-sm" onclick="duplicateTab('${tab.id}')" title="Duplicate tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
      </div>

      <!-- Fields -->
      <div class="left-panel-fields">
        <div class="form-grid" id="fields_${tab.id}">
          ${fieldsHtml}
        </div>
        <div style="height:24px"></div>
      </div>
    </div>

    <!-- RIGHT: TMDL preview -->
    <div class="right-panel">
      <div class="right-panel-top">
        <div class="rpt-info">
          <div class="rpt-title">${esc(tab.label)} <span style="font-weight:400;color:var(--ta-muted)">— ${type.desc}</span></div>
          <div class="rpt-sub">Live TMDL · compatibility level ${tab.values.compat||'1567'}</div>
        </div>
        <div class="rpt-actions">
          <button class="btn-secondary" onclick="copyCode('${tab.id}')" style="font-size:12px;padding:7px 13px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy
          </button>
          <button class="btn-primary" onclick="saveTabFile('${tab.id}')" style="font-size:12px;padding:7px 13px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save .tmdl
          </button>
        </div>
      </div>

      <!-- Code block -->
      <div class="code-outer">
        <div class="code-toolbar">
          <span class="code-lang">
            <span class="code-lang-dot"></span>
            TMDL &mdash; ${type.label}
          </span>
        </div>
        <div class="code-content" id="code_${tab.id}"></div>
      </div>

      <div class="info-strip">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Spec: tab-indentation, camelCase keywords, single-quote names with spaces. Save as <code>.tmdl</code> into your TMDL folder structure.
        <a href="https://learn.microsoft.com/en-us/analysis-services/tmdl/tmdl-overview" target="_blank" style="color:#2B6CB0;text-decoration:underline;margin-left:4px">MS Docs ↗</a></span>
      </div>
    </div>
  </div>`;
}

// ── Field renderer ────────────────────────────────────────────
function renderField(f,values){
  const val=values[f.id]!==undefined?values[f.id]:'';
  const req=f.required?'<span class="req">*</span>':'';
  const hint=f.hint?`<div class="form-hint">${f.hint}</div>`:'';

  if(f.type==='toggle'){
    return `<div class="form-group span-2">
      <div class="toggle-row">
        <span class="toggle-lbl">${f.label}</span>
        <label class="toggle">
          <input type="checkbox" data-field="${f.id}" ${val?'checked':''} onchange="onFieldChange(this)"/>
          <span class="toggle-sl"></span>
        </label>
      </div></div>`;
  }
  if(f.type==='textarea'){
    return `<div class="form-group span-2">
      <label class="form-label">${f.label} ${req}</label>
      <textarea class="form-textarea" data-field="${f.id}" placeholder="${esc(f.placeholder||'')}" oninput="onFieldChange(this)">${esc(val)}</textarea>
      ${hint}</div>`;
  }
  if(f.type==='select'){
    const opts=(f.options||[]).map(o=>`<option value="${esc(o)}" ${val===o?'selected':''}>${esc(o)}</option>`).join('');
    return `<div class="form-group">
      <label class="form-label">${f.label} ${req}</label>
      <select class="form-select" data-field="${f.id}" onchange="onFieldChange(this)">${opts}</select>
      ${hint}</div>`;
  }
  return `<div class="form-group">
    <label class="form-label">${f.label} ${req}</label>
    <input type="text" class="form-input" data-field="${f.id}" value="${esc(val)}" placeholder="${esc(f.placeholder||'')}" oninput="onFieldChange(this)" />
    ${hint}</div>`;
}

// ── Field change handler ──────────────────────────────────────
function onFieldChange(el){
  const tab=tabs.find(t=>t.id===activeTabId);if(!tab)return;
  tab.values[el.dataset.field]=el.type==='checkbox'?el.checked:el.value;
  const type=OBJECT_TYPES.find(o=>o.id===tab.typeId);
  updateCodePreview(tab,type);
  // Update right panel subtitle compat level
  const sub=document.querySelector(`#sp_${tab.id} .rpt-sub`);
  if(sub)sub.textContent=`Live TMDL · compatibility level ${tab.values.compat||'1567'}`;
}

function onTypeChange(el, tabId){
  const tab=tabs.find(t=>t.id===tabId);if(!tab)return;
  const newTypeId=el.value;
  const newType=OBJECT_TYPES.find(o=>o.id===newTypeId);if(!newType)return;
  tab.typeId=newTypeId;
  tab.values={};
  newType.fields.forEach(f=>{
    if(f.def!==undefined) tab.values[f.id]=f.def;
    else if(f.type==='toggle') tab.values[f.id]=false;
    else tab.values[f.id]='';
  });
  // Keep user's label
  renderTabs();
  renderCanvas();
}

function onTabRename(el, tabId){
  const tab=tabs.find(t=>t.id===tabId);if(!tab)return;
  tab.label=el.value;
  renderTabs();
  // update right panel title
  const rptTitle=document.querySelector(`#sp_${tabId} .rpt-title`);
  const type=OBJECT_TYPES.find(o=>o.id===tab.typeId);
  if(rptTitle)rptTitle.innerHTML=`${esc(tab.label)} <span style="font-weight:400;color:var(--ta-muted)">— ${type.desc}</span>`;
}

function updateCodePreview(tab,type){
  const el=document.getElementById(`code_${tab.id}`);if(!el)return;
  try{el.innerHTML=type.generate(tab.values);}
  catch(e){el.textContent='// Error: '+e.message;}
}

// ── Actions ───────────────────────────────────────────────────
function copyCode(tabId){
  const el=document.getElementById(`code_${tabId}`);if(!el)return;
  const text=stripHTML(el.innerHTML);
  navigator.clipboard.writeText(text).then(()=>showToast('Copied to clipboard','success'));
}
function saveTabFile(tabId){
  const tab=tabs.find(t=>t.id===tabId);if(!tab)return;
  const el=document.getElementById(`code_${tabId}`);if(!el)return;
  const text=stripHTML(el.innerHTML);
  const fname=tab.label.replace(/[^a-zA-Z0-9_\-\s]/g,'').replace(/\s+/g,'_')+'.tmdl';
  downloadFile(text,fname);
  showToast('Saved '+fname,'success');
}
function duplicateTab(tabId){
  const tab=tabs.find(t=>t.id===tabId);if(!tab)return;
  const newId=createTab(tab.typeId,tab.label+' (Copy)');
  const newTab=tabs.find(t=>t.id===newId);
  newTab.values=JSON.parse(JSON.stringify(tab.values));
  activeTabId=newId;
  renderTabs();renderCanvas();
}
function exportAll(){
  if(!tabs.length){showToast('No tabs to export','error');return;}
  let combined=`// TMDL Generator – Tiger Analytics\n// Exported: ${new Date().toISOString()}\n\n`;
  tabs.forEach(tab=>{
    const type=OBJECT_TYPES.find(o=>o.id===tab.typeId);
    const el=document.getElementById(`code_${tab.id}`);
    const text=el?stripHTML(el.innerHTML):stripHTML(type.generate(tab.values));
    combined+=`// ─── ${tab.label} (${type.label}) ───\n${text}\n\n`;
  });
  downloadFile(combined,'model_export.tmdl');
  showToast(`Exported ${tabs.length} template(s)`,'success');
}
function downloadFile(content,filename){
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer=null;
function showToast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg;el.className=`toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('btnAddTab').addEventListener('click',()=>createTab('measure',null));
  // Start with a measure tab
  createTab('measure','Sales Amount');
});
