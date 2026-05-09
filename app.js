/* ============================================================
   TMDL Generator  |  app.js
   No-sidebar layout · dropdown-driven · 15 object types
   ============================================================ */

// ── Object type registry ──────────────────────────────────────
const OBJECT_TYPES = [
  {
    id:'model', label:'Model', icon:'📐', color:'#0EA5E9',
    badge:'#F0F9FF', badgeText:'#0369A1', desc:'Defines top-level model properties: culture, data source version, and processing behavior. Required as the root file in every TMDL folder structure.',
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
    badge:'#ECFDF5', badgeText:'#065F46', desc:'Declares a physical table with its partition query and storage mode. Each table file contains columns, measures, and hierarchies scoped to that table.',
    group:'Tables',
    fields:[
      {id:'tableName',   label:'Table Name',              type:'text',    placeholder:'Sales', required:true},
      {id:'sourceTable', label:'Source Table / Object',    type:'text',    placeholder:'dbo.FactSales'},
      {id:'mode',        label:'Storage Mode',             type:'select',  options:['import','directQuery','dual'], def:'import'},
      {id:'connector',   label:'Data Source Connector',    type:'select',  options:['SQL Server','Azure SQL','Azure Synapse','Databricks','PostgreSQL','MySQL','Oracle','Snowflake','BigQuery','Azure Data Lake'], def:'SQL Server'},
      {id:'server',      label:'Server / Host (or Parameter Name)',    type:'text',    placeholder:'Databricks_Server'},
      {id:'database',    label:'Database / Catalog',       type:'text',    placeholder:'AdventureWorksDW'},
      {id:'schema',      label:'Schema / Namespace',       type:'text',    placeholder:'dbo'},
      {id:'httpPath',    label:'HTTP Path Parameter (Databricks)',    type:'text',    placeholder:'Databricks_Path'},
      {id:'queryGroup',  label:'Query Group',                          type:'text',    placeholder:'Main Queries'},
      {id:'isHidden',    label:'Hidden',                   type:'toggle'},
      {id:'desc',        label:'Description',              type:'textarea',placeholder:'Contains transactional sales data'},
    ],
    generate: v => buildTable(v),
  },
  {
    id:'measure', label:'Measure', icon:'📏', color:'#F59E0B',
    badge:'#FFFBEB', badgeText:'#92400E', desc:'A named DAX calculation evaluated in filter context at query time. Stored in the parent table file; supports format strings and display folders.',
    group:'Tables',
    fields:[
      {id:'tableName',    label:'Parent Table',    type:'text',    placeholder:'Sales', required:true},
      {id:'measureName',  label:'Measure Name',    type:'text',    placeholder:'Sales Amount', required:true},
      {id:'expression',   label:'DAX Expression',  type:'textarea',placeholder:"SUMX('Sales', 'Sales'[Quantity] * 'Sales'[Net Price])", required:true},
      {id:'formatString', label:'Format String',   type:'select',  options:['$ #,##0','$ #,##0.00','#,##0','#,##0.00','0%','0.00%','dd/MM/yyyy','General','Custom...'], def:'$ #,##0'},
      {id:'customFormat', label:'Custom Format (if Custom selected)', type:'text', placeholder:'#,##0.00 "units"'},
      {id:'displayFolder',label:'Display Folder',  type:'text',    placeholder:'Key Measures'},
      {id:'isHidden',     label:'Hidden',          type:'toggle'},
      {id:'desc',         label:'Description',     type:'textarea',placeholder:'Total sales revenue'},
    ],
    generate: v => buildMeasure(v),
  },
  {
    id:'column', label:'Column', icon:'🏛️', color:'#14B8A6',
    badge:'#F0FDFA', badgeText:'#134E4A', desc:'A physical column sourced from the data source via its sourceColumn mapping. Supports data type, format string, sort-by column, display folder, and summarization.',
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
    badge:'#F5F3FF', badgeText:'#5B21B6', desc:'A DAX expression evaluated row-by-row during refresh and stored in the model in memory. Supports all standard column properties plus a full DAX expression.',
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
    id:'date_table', label:'Date Table', icon:'📅', color:'#0891B2',
    badge:'#ECFEFF', badgeText:'#155E75', desc:'A pre-built calculated Date dimension with 11 standard calendar columns and an optional Date Hierarchy. Uses CALENDAR() as the partition source — no external query required.',
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
    badge:'#FFF7ED', badgeText:'#9A3412', desc:'A named drill-down path through two or more columns in the same table. Each level references an existing column and is assigned an ordinal position.',
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
    badge:'#F8FAFC', badgeText:'#1E293B', desc:'Defines a join between two columns across tables with cardinality and cross-filter direction. Inactive relationships require USERELATIONSHIP() in DAX to activate.',
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
    badge:'#FEF2F2', badgeText:'#991B1B', desc:'A security role with model-level permission and optional row-level security (RLS) filters. tablePermission restricts which rows each role member can see.',
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
    badge:'#ECFEFF', badgeText:'#164E63', desc:'A shared M expression or named parameter reused across multiple partition queries. Parameters expose values that can be changed without editing individual table partition sources.',
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
    badge:'#F5F3FF', badgeText:'#4C1D95', desc:'A calculation group applies a dynamic modifier to any measure in the model via SELECTEDMEASURE(). Each calculation item is a named DAX expression with an ordinal order.',
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
    badge:'#FFFBEB', badgeText:'#78350F', desc:'Maps an aggregation table back to a detail table so the engine can auto-redirect queries. The alternateOf block on each column defines which detail column it replaces.',
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
    badge:'#FAF5FF', badgeText:'#6B21A8', desc:'A reusable DAX User Defined Function (UDF) with typed input parameters and a declared return type. Called from measures and calculated columns just like any native DAX function.',
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
    badge:'#F0F9FF', badgeText:'#0C4A6E', desc:'A linguistic schema that defines natural-language synonyms for Q&A and Copilot. Embeds a JSON linguisticMetadata block with entity names and synonym lists.',
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
    badge:'#ECFEFF', badgeText:'#164E63', desc:'A named subset of tables, columns, and measures for a specific business audience. Does not affect security — it only controls visibility in client reporting tools.',
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
  const pName=tName;
  const src=v.sourceTable||'dbo.FactTable';
  const srv=v.server||'localhost';
  const db=v.database||'AdventureWorksDW';
  const schema=v.schema||'dbo';
  const httpPath=v.httpPath||'Databricks_Path';
  const queryGroup=v.queryGroup||'';
  const connector=v.connector||'SQL Server';
  const mode=v.mode||'import';
  const p=src.split('.');

  // Build connector-specific M query
  let mQuery='';
  if(connector==='SQL Server'||connector==='Azure SQL'||connector==='Azure Synapse'){
    const schm=p.length>1?p[0]:schema; const tbl=p.length>1?p[1]:src;
    const host=connector==='Azure SQL'?`${srv}.database.windows.net`:connector==='Azure Synapse'?`${srv}.sql.azuresynapse.net`:srv;
    mQuery=`let\n                Source = Sql.Database("${esc(host)}", "${esc(db)}"),\n                Schema = Source{[Name="${esc(schm)}"]}[Data],\n                Navigation = Schema{[Name="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='Databricks'){
    const cat=db||'salesanalytics'; const sch=schema||'dbo'; const tbl=p[p.length-1]||tName;
    const srvParam=srv||'Databricks_Server'; const pathParam=httpPath||'Databricks_Path';
    mQuery=`let\n                Source = Databricks.Catalogs("${esc(srvParam)}", "${esc(pathParam)}", [Catalog=null, Database=null, EnableAutomaticProxyDiscovery=null]),\n                Catalog = Source{[Name="${esc(cat)}",Kind="Database"]}[Data],\n                Schema = Catalog{[Name="${esc(sch)}",Kind="Schema"]}[Data],\n                Table = Schema{[Name="${esc(tbl)}",Kind="Table"]}[Data]\n            \n            in\n                Table`;
  } else if(connector==='PostgreSQL'){
    const schm=p.length>1?p[0]:schema; const tbl=p.length>1?p[1]:src;
    mQuery=`let\n                Source = PostgreSQL.Database("${esc(srv)}", "${esc(db)}"),\n                Navigation = Source{[Schema="${esc(schm)}",Item="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='MySQL'){
    const tbl=p[p.length-1];
    mQuery=`let\n                Source = MySQL.Database("${esc(srv)}", "${esc(db)}"),\n                Navigation = Source{[Schema=null,Item="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='Oracle'){
    const schm=p.length>1?p[0]:db; const tbl=p.length>1?p[1]:src;
    mQuery=`let\n                Source = Oracle.Database("${esc(srv)}"),\n                Schema = Source{[Schema="${esc(schm)}"]}[Data],\n                Navigation = Schema{[Name="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='Snowflake'){
    const sch=p.length>2?p[1]:(p.length>1?p[0]:schema); const tbl=p[p.length-1];
    mQuery=`let\n                Source = Snowflake.Databases("${esc(srv)}"),\n                Database = Source{[Name="${esc(db)}",Kind="Database"]}[Data],\n                Schema = Database{[Name="${esc(sch)}",Kind="Schema"]}[Data],\n                Navigation = Schema{[Name="${esc(tbl)}",Kind="Table"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='BigQuery'){
    const dataset=p.length>1?p[0]:schema; const tbl=p.length>1?p[1]:src;
    mQuery=`let\n                Source = GoogleBigQuery.Database([BillingProject="${esc(srv)}"]),\n                Dataset = Source{[Name="${esc(dataset)}"]}[Data],\n                Navigation = Dataset{[Name="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  } else if(connector==='Azure Data Lake'){
    mQuery=`let\n                Source = AzureStorage.DataLake(\n                    "https://${esc(srv)}.dfs.core.windows.net/${esc(db)}"\n                ),\n                Navigation = Source{[relativePath="${esc(src)}",MediaType="text/csv"]}[Content]\n            in\n                Navigation`;
  } else {
    const schm=p.length>1?p[0]:schema; const tbl=p.length>1?p[1]:src;
    mQuery=`let\n                Source = Sql.Database("${esc(srv)}", "${esc(db)}"),\n                Navigation = Source{[Schema="${esc(schm)}",Item="${esc(tbl)}"]}[Data]\n            in\n                Navigation`;
  }

  let o='';
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(tName))}</span>\n`;
  if(v.isHidden)o+=`    <span class="tk-prop">isHidden</span>\n`;
  o+=`\n    <span class="tk-kw">column</span> <span class="tk-obj">Column1</span>\n        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">int64</span>\n`;
  o+=`\n    <span class="tk-kw">partition</span> <span class="tk-obj">${esc(q(pName))}</span> <span class="tk-eq">=</span> <span class="tk-str">m</span>\n`;
  o+=`        <span class="tk-prop">mode</span><span class="tk-eq">:</span> <span class="tk-str">${mode}</span>\n`;
  if(connector==='Databricks'&&queryGroup)o+=`        <span class="tk-prop">queryGroup</span><span class="tk-eq">:</span> <span class="tk-str">'${esc(queryGroup)}'</span>\n`;
  o+=`        <span class="tk-prop">source</span> <span class="tk-eq">=</span>\n`;
  o+=`            <span class="tk-dax">${mQuery}</span>\n`;
  if(connector==='Databricks'){
    o+=`\n    <span class="tk-prop">annotation</span> <span class="tk-obj">PBI_NavigationStepName</span> <span class="tk-eq">=</span> <span class="tk-str">Navigation</span>\n`;
    o+=`\n    <span class="tk-prop">annotation</span> <span class="tk-obj">PBI_ResultType</span> <span class="tk-eq">=</span> <span class="tk-str">Table</span>\n`;
  }
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
    o+=`\n        <span class="tk-prop">annotation</span> <span class="tk-obj">SummarizationSetBy</span> <span class="tk-eq">=</span> <span class="tk-str">Automatic</span>\n`;
  });
  // Mark date col sort
  o+=`\n    <span class="tk-cmt">/// Sort Month by MonthNo, Weekday by WeekdayNo</span>\n`;
  // Date hierarchy
  if(addHier){
    o+=`\n    <span class="tk-kw">hierarchy</span> <span class="tk-obj">'Date Hierarchy'</span>\n`;
    [{n:'Year',c:'Year'},{n:'Quarter',c:'Quarter'},{n:'Month',c:'Month'},{n:'Day',c:'Day'}].forEach((lv,i)=>{
      o+=`\n        <span class="tk-kw">level</span> <span class="tk-obj">${lv.n}</span>\n`;
      o+=`            <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${i}</span>\n`;
      o+=`            <span class="tk-prop">column</span><span class="tk-eq">:</span> <span class="tk-str">${lv.c}</span>\n`;
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
  levels.forEach((lv,i)=>{
    const c=lv.trim();
    o+=`\n        <span class="tk-kw">level</span> <span class="tk-obj">${esc(q(c))}</span>\n`;
    o+=`            <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${i}</span>\n`;
    o+=`            <span class="tk-prop">column</span><span class="tk-eq">:</span> <span class="tk-str">${esc(q(c))}</span>\n`;
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
  }
  rawItems.forEach((item,idx)=>{
    const parts=item.split('|');if(parts.length<2)return;
    const iName=parts[0].trim();const iExpr=parts.slice(1).join('|').trim();
    const isML=iExpr.includes('\n')||iExpr.length>60;
    o+=`\n    <span class="tk-kw">calculationItem</span> <span class="tk-obj">${esc(q(iName))}</span>`;
    if(isML){o+=` <span class="tk-eq">=</span>\n`+iExpr.split('\n').map(l=>`            <span class="tk-dax">${esc(l)}</span>`).join('\n')+'\n';}
    else{o+=` <span class="tk-eq">=</span> <span class="tk-dax">${esc(iExpr)}</span>\n`;}
    o+=`        <span class="tk-prop">ordinal</span><span class="tk-eq">:</span> <span class="tk-num">${idx}</span>\n`;
  });
  return o.trimEnd();
}
function buildAggregation(v){
  const aggTable=v.aggTable||'Sales_Agg';const detailTable=v.detailTable||'Sales';
  const mode=v.storageMode||'import';
  const mappings=(v.mappings||'SalesAmount | SalesAmount | sum\nCustomerKey | CustomerKey | groupBy').split('\n').filter(l=>l.trim());
  let o='';
  // NOTE: This template cannot be deployed as a standalone TMDL file.
  // The alternateOf section must be part of the aggregation table definition
  // inside your model's table TMDL file. Copy the column blocks below into the
  // relevant table file alongside the partition definition.
  o+=`<span class="tk-cmt">/// NOTE: Aggregation mappings cannot be deployed as a standalone script.\n/// Copy the column + alternateOf blocks into your aggregation table TMDL file.\n/// The alternateOf section maps each agg column back to its detail table column.</span>\n\n`;
  if(v.desc)o+=`<span class="tk-cmt">/// ${esc(v.desc)}</span>\n`;
  o+=`<span class="tk-kw">table</span> <span class="tk-obj">${esc(q(aggTable))}</span>\n`;
  o+=`\n    <span class="tk-kw">partition</span> <span class="tk-obj">${esc(q(aggTable+'-Partition'))}</span> <span class="tk-eq">=</span> <span class="tk-str">m</span>\n`;
  o+=`        <span class="tk-prop">mode</span><span class="tk-eq">:</span> <span class="tk-str">${mode}</span>\n`;
  o+=`        <span class="tk-prop">source</span> <span class="tk-eq">=</span> <span class="tk-cmt">// M expression for aggregation table source</span>\n`;
  o+=`\n    <span class="tk-cmt">// ── alternateOf column mappings ──────────────────────────</span>\n`;
  mappings.forEach(m=>{
    const p=m.split('|');if(p.length<3)return;
    const aggCol=p[0].trim();const detailCol=p[1].trim();const summ=p[2].trim();
    o+=`\n    <span class="tk-kw">column</span> <span class="tk-obj">${esc(q(aggCol))}</span>\n`;
    o+=`        <span class="tk-prop">dataType</span><span class="tk-eq">:</span> <span class="tk-str">int64</span>\n`;
    o+=`        <span class="tk-prop">summarizeBy</span><span class="tk-eq">:</span> <span class="tk-str">${esc(summ)}</span>\n`;
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
let state = { typeId: 'measure', values: {} };

function initValues(typeId){
  const type = OBJECT_TYPES.find(o=>o.id===typeId);
  const values = {};
  type.fields.forEach(f=>{
    if(f.def!==undefined) values[f.id]=f.def;
    else if(f.type==='toggle') values[f.id]=false;
    else values[f.id]='';
  });
  return values;
}

// ── Render main canvas ─────────────────────────────────────────
function renderCanvas(){
  const type = OBJECT_TYPES.find(o=>o.id===state.typeId);
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = renderSplitPane(type);
  updateCodePreview();
}

// ── Split pane ────────────────────────────────────────────────
function renderSplitPane(type){
  const options = OBJECT_TYPES.map(o=>`<option value="${o.id}" ${o.id===state.typeId?'selected':''}>${o.icon} ${o.label}</option>`).join('');
  const badgeStyle = `background:${type.badge};color:${type.badgeText}`;
  const fieldsHtml = type.fields.map(f=>renderField(f,state.values)).join('');

  return `<div class="split-pane" id="sp_main">

    <!-- LEFT: dropdown + form -->
    <div class="left-panel">
      <div class="left-panel-top">
        <div class="obj-type-row">
          <span class="obj-type-label">Object Type</span>
          <div class="select-wrapper">
            <select class="obj-type-select" onchange="onTypeChange(this)">
              ${options}
            </select>
          </div>
          <span class="type-badge" style="${badgeStyle}" id="badge_main">${type.icon} ${type.label}</span>
        </div>
      </div>

      <!-- Fields -->
      <div class="left-panel-fields">
        <div class="form-grid" id="fields_main">
          ${fieldsHtml}
        </div>
        <div style="height:24px"></div>
      </div>
    </div>

    <!-- RIGHT: TMDL preview -->
    <div class="right-panel">
      <div class="right-panel-top">
        <div class="rpt-info">
          <div class="rpt-title" id="rpt_title">${type.icon} ${esc(type.label)} <span style="font-weight:400;color:var(--c-muted)">— ${type.desc.split('.')[0]}.</span></div>
          <div class="rpt-sub">Live TMDL preview</div>
        </div>
        <div class="rpt-actions">
          <button class="btn-secondary" onclick="copyCode()" style="font-size:12px;padding:7px 13px">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copy
          </button>
          <button class="btn-primary" onclick="saveFile()" style="font-size:12px;padding:7px 13px">
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
        <div class="code-content" id="code_main"></div>
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

// ── Change handlers ───────────────────────────────────────────
function onFieldChange(el){
  state.values[el.dataset.field] = el.type==='checkbox' ? el.checked : el.value;
  updateCodePreview();
}

function onTypeChange(el){
  state.typeId = el.value;
  state.values = initValues(el.value);
  renderCanvas();
}

function updateCodePreview(){
  const el = document.getElementById('code_main');
  if(!el) return;
  const type = OBJECT_TYPES.find(o=>o.id===state.typeId);
  try{
    const body = type.generate(state.values);
    // Indent entire object block one level under createOrReplace (TMDL spec)
    const indented = body.split('\n').map(l => l.length ? '    '+l : l).join('\n');
    el.innerHTML = `<span class="tk-kw">createOrReplace</span>\n\n` + indented;
  } catch(e){ el.textContent = '// Error: '+e.message; }
}

// ── Actions ───────────────────────────────────────────────────
function copyCode(){
  const el = document.getElementById('code_main');
  if(!el) return;
  navigator.clipboard.writeText(stripHTML(el.innerHTML))
    .then(()=>showToast('Copied to clipboard','success'));
}

function saveFile(){
  const el = document.getElementById('code_main');
  if(!el) return;
  const type = OBJECT_TYPES.find(o=>o.id===state.typeId);
  const text = stripHTML(el.innerHTML);
  const fname = type.label.replace(/[^a-zA-Z0-9_\-\s]/g,'').replace(/\s+/g,'_').toLowerCase()+'.tmdl';
  downloadFile(text, fname);
  showToast('Saved '+fname, 'success');
}

function downloadFile(content,filename){
  const blob = new Blob([content],{type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer=null;
function showToast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className=`toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  state.values = initValues('measure');
  renderCanvas();
});

