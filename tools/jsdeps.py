"""src/js 조각끼리 무엇을 주고받는지 본다(나중에 불러오는 조각을 고를 때 쓴다).

  python tools/jsdeps.py              조각마다: 밖에서 쓰는 이름 → 쓰는 조각
  python tools/jsdeps.py 35-guidebook 한 조각만

자바스크립트를 대충 토큰으로 나눈다(문자열·주석·정규식은 건너뛰고, 템플릿 문자열 안의 ${…}는 코드로 읽는다).
조각의 맨 바깥(중괄호 깊이 0)에서 선언한 function/const/let/var/class 이름을 모으고,
다른 조각에서 같은 이름을 '.' 뒤가 아닌 자리에 쓰면 쓰는 것으로 본다. 조금 넉넉하게(많이) 잡는 쪽으로 틀린다.
"""
import os, re, sys

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'js')
KW = set('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield await of async true false null undefined'.split())
RX_PREV = set('( , = : [ ! & | ? { } ; + - * % < > ~ ^ =>'.split()) | {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', ''}


def tokens(s):
    """(종류, 값, 깊이) 목록. 종류: id, p(구두점)"""
    out, i, n, depth, prev = [], 0, len(s), 0, ''
    tstack = []   # 템플릿 ${ 안에 들어갈 때의 중괄호 깊이
    while i < n:
        c = s[i]
        if c in ' \t\r\n':
            i += 1; continue
        if s.startswith('//', i):
            i = s.find('\n', i); i = n if i < 0 else i; continue
        if s.startswith('/*', i):
            i = s.find('*/', i + 2) + 2; continue
        if c in '\'"':
            j = i + 1
            while s[j] != c:
                j += 2 if s[j] == '\\' else 1
            i = j + 1; prev = 'str'; continue
        if c == '`' or (c == '}' and tstack and tstack[-1] == depth):
            if c == '}':
                tstack.pop()
            j = i + 1
            while True:
                if s[j] == '\\': j += 2; continue
                if s[j] == '`': i = j + 1; prev = 'str'; break
                if s.startswith('${', j):
                    tstack.append(depth); i = j + 2; prev = '('; break
                j += 1
            continue
        if c == '/' and prev in RX_PREV:
            j, cls = i + 1, False
            while True:
                if s[j] == '\\': j += 2; continue
                if s[j] == '[': cls = True
                elif s[j] == ']': cls = False
                elif s[j] == '/' and not cls: break
                j += 1
            j += 1
            while j < n and s[j].isalpha(): j += 1
            i = j; prev = 'str'; continue
        m = re.match(r'[A-Za-z_$À-￿][\w$À-￿]*', s[i:i + 80])
        if m:
            w = m.group(0); out.append(('id', w, depth)); i += len(w); prev = w if w in KW else 'id'; continue
        m = re.match(r'\d[\d._eExXa-fA-F]*', s[i:i + 40])
        if m:
            i += len(m.group(0)); prev = 'num'; continue
        if s.startswith('=>', i):
            out.append(('p', '=>', depth)); i += 2; prev = '=>'; continue
        if c in '{([':
            out.append(('p', c, depth)); depth += 1
        elif c in '})]':
            depth -= 1; out.append(('p', c, depth))
        else:
            out.append(('p', c, depth))
        prev = c; i += 1
    return out


def decls(T):
    """맨 바깥에서 선언한 이름"""
    names, k = [], 0
    while k < len(T):
        t, v, d = T[k]
        if d == 0 and t == 'id' and v in ('function', 'class') and k + 1 < len(T) and T[k + 1][0] == 'id':
            names.append(T[k + 1][1])
        if d == 0 and t == 'id' and v in ('const', 'let', 'var'):
            j, want = k + 1, True
            while j < len(T):
                tt, vv, dd = T[j]
                if dd == 0 and tt == 'p' and vv == ';': break
                if dd == 0 and want and tt == 'id': names.append(vv); want = False
                elif dd == 0 and want and tt == 'p' and vv in '[{':   # 구조 분해: 안쪽 이름을 다 넣는다
                    q = j + 1
                    while T[q][2] > 0:
                        if T[q][0] == 'id': names.append(T[q][1])
                        q += 1
                    want = False; j = q; continue
                if dd == 0 and tt == 'p' and vv == ',': want = True
                if dd == 0 and tt == 'id' and vv in ('function', 'const', 'let', 'var', 'class') : break
                j += 1
            k = j; continue
        k += 1
    return names


def refs(T):
    """'.' 뒤가 아닌 자리의 이름(깊이 상관없이)"""
    r = set()
    for k, (t, v, d) in enumerate(T):
        if t == 'id' and v not in KW and not (k and T[k - 1] == ('p', '.', d)):
            r.add(v)
    return r


def load():
    F = sorted(f[:-3] for f in os.listdir(D) if f.endswith('.js'))
    info = {}
    for f in F:
        T = tokens(open(os.path.join(D, f + '.js'), encoding='utf-8').read())
        info[f] = (decls(T), refs(T))
    return F, info


def main():
    F, info = load()
    only = sys.argv[1:] or F
    for f in only:
        ds, _ = info[f]
        used = {}
        for g in F:
            if g == f: continue
            rs = info[g][1]
            for nm in ds:
                if nm in rs: used.setdefault(nm, []).append(g[:2])
        print('%s  선언 %d · 밖에서 쓰는 이름 %d' % (f, len(ds), len(used)))
        for nm, gs in used.items():
            print('   %-16s ← %s' % (nm, ' '.join(gs)))


if __name__ == '__main__':
    main()
