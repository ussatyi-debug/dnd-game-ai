"""Ответ Gemini (en + ru) → data/raw/phb2024/<kind>.json и data/rules/<out>.json."""
import json,sys
kind=sys.argv[1]  # subclasses | feats
files=sys.argv[2:]
rawp=f'data/raw/phb2024/{kind}.json'; outp=f'data/rules/{"subclasses" if kind=="subclasses" else "phb_feats"}.json'
raw=json.load(open(rawp)); out=json.load(open(outp))
idx={r['id']:i for i,r in enumerate(raw['records'])}
n=0
for f in files:
    for g in json.load(open(f)):
        i=idx.get(g['id'])
        if i is None: print('нет в каркасе:',g['id']); continue
        r=raw['records'][i]
        if kind=='subclasses':
            r['features']=[{"level":x['level'],"name":x['name'],"mechanics":x['mechanics']} for x in g['features']]
            ru={"id":r['id'],"class":r['class'],"name":g['name_ru'],"name_en":r['name'],
                "features":[{"level":x['level'],"name":x['name_ru'],"name_en":x['name'],"mechanics":x['mechanics_ru']} for x in g['features']]}
        else:
            r['prerequisite']=g.get('prerequisite',''); r['mechanics']=g['mechanics']
            if g.get('type'): r['type']=g['type']
            ru={"id":r['id'],"type":r.get('type',''),"name":g['name_ru'],"name_en":r['name'],
                "prerequisite":g.get('prerequisite_ru',''),"mechanics":g['mechanics_ru']}
        r['status']='ready'
        if g.get('verify'): r['verify']=g['verify']; ru['check']=g['verify']
        else: r.pop('verify',None)
        ru['source']='gemini'
        out['records'][r['id']]=ru; n+=1
json.dump(raw,open(rawp,'w'),ensure_ascii=False,indent=1); open(rawp,'a').write('\n')
json.dump(out,open(outp,'w'),ensure_ascii=False,indent=1); open(outp,'a').write('\n')
print('записано',n,'; готово в',outp,len(out['records']))
