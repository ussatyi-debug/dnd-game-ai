import json,sys
sys.path.insert(0,'tools'); import translate_local as t
def val_sub(path, expect_ids):
    d=json.load(open(path)); probs=[]
    ids=[r['id'] for r in d]
    if set(ids)!=set(expect_ids): probs.append(f"ids: нет {set(expect_ids)-set(ids)}, лишние {set(ids)-set(expect_ids)}")
    for r in d:
        for f in r.get('features',[]):
            m,mr=f.get('mechanics',[]),f.get('mechanics_ru',[])
            if len(m)!=len(mr): probs.append(f"{r['id']}/{f['name']}: пунктов {len(m)}≠{len(mr)}"); continue
            if t.dice_of(m)!=t.dice_of(mr): probs.append(f"{r['id']}/{f['name']}: кубы {t.dice_of(m)} vs {t.dice_of(mr)}")
            a,b=t.numbers_of(m),t.numbers_of(mr)
            b2=b.copy(); a["1"]=min(a["1"],b["1"])
            if a!=b: probs.append(f"{r['id']}/{f['name']}: числа -{dict(a-b)} +{dict(b-a)}")
            if any(t.CJK.search(x) for x in mr): probs.append(f"{r['id']}: иероглифы")
    return d,probs
if __name__=="__main__":
    exp=[x['id'] for x in json.load(open(sys.argv[2]))]
    d,p=val_sub(sys.argv[1],exp)
    print(len(d),"записей; замечаний",len(p)); print("\n".join(p))
    print("verify:",[ (r['id'],r['verify'][:120]) for r in d if r.get('verify')])
