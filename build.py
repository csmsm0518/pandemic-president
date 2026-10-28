"""팬데믹 대통령 빌드: src/ 의 조각을 모아 index.html · game.css · game.js · lazy/*.js 를 만든다.

  python build.py          만들기
  python build.py --check  만든 파일이 src/ 와 맞는지만 확인(커밋 전에)
  python build.py --single 경로.html   모든 것을 한 파일에 넣은 판(인터넷 없이 열어 보기·바탕화면 사본용)

- 처음부터 받는 코드는 src/js/ 에 기능별로 나뉘어 있다. 파일 이름 순서대로 이어 붙여 (function(){ … })(); 하나로 감싼다.
  그래서 조각끼리는 예전 한 파일일 때처럼 서로의 변수를 그대로 쓴다. 디자인은 src/css/ 를 같은 식으로 이어 붙인다.
- 나중에 받는 조각은 src/lazy/<이름>/ 에 있다(코드 .js 와 그 화면에서만 쓰는 디자인 .css). lazy/<이름>.js 하나로 묶고,
  게임은 그 조각을 처음 쓸 때(또는 첫 화면이 뜬 뒤 쉬는 틈에) 받아 src/js/00a-lazy.js 의 lzRun 안에서 실행한다.
  · 조각 밖에서 부르는 조각 안의 함수는, 같은 이름의 '대신 부르기' 함수를 여기서 만들어 붙인다(받은 뒤 진짜를 부른다).
  · 조각 밖에서 조각 안의 변수(const/let)를 쓰면 빌드가 멈춘다. 그 변수는 src/js/ 로 옮겨야 한다.
- 파일 주소에 내용 지문(?v=…)을 달아, 바뀐 파일만 새로 받게 한다.
- 만든 파일(index.html, game.css, game.js, lazy/)은 직접 고치지 않는다. 고칠 곳은 src/ 다.
"""
import hashlib, json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import jsdeps  # noqa: E402


def read(p):
    return open(p, encoding='utf-8').read()


def files(d, ext):
    return [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith(ext)] if os.path.isdir(d) else []


def cat(fs):
    return ''.join(read(f) for f in fs)


def sha(s, n):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()[:n]


def fail(msg):
    sys.exit('빌드 멈춤: ' + msg)


def top_functions(T):
    """맨 바깥의 function 선언 이름"""
    return [T[k + 1][1] for k, (t, v, d) in enumerate(T) if d == 0 and t == 'id' and v == 'function' and k + 1 < len(T) and T[k + 1][0] == 'id']


def build():
    eager_fs = files(os.path.join(SRC, 'js'), '.js')
    eager = cat(eager_fs)
    css = cat(files(os.path.join(SRC, 'css'), '.css'))
    eager_refs = jsdeps.refs(jsdeps.tokens(eager))
    shell = read(os.path.join(SRC, 'shell.html'))

    lazy_root = os.path.join(SRC, 'lazy')
    names = sorted(d for d in os.listdir(lazy_root) if os.path.isdir(os.path.join(lazy_root, d))) if os.path.isdir(lazy_root) else []
    chunks = {}
    for n in names:
        js = cat(files(os.path.join(lazy_root, n), '.js'))
        T = jsdeps.tokens(js)
        chunks[n] = {'js': js, 'css': cat(files(os.path.join(lazy_root, n), '.css')), 'decl': jsdeps.decls(T), 'fn': top_functions(T), 'refs': jsdeps.refs(T)}

    # 조각 밖(처음 받는 코드 · 다른 조각)에서 부르는 이름 → 대신 부르기 함수
    stubs, owner = [], {}
    eager_decl = set(jsdeps.decls(jsdeps.tokens(eager)))
    for n, c in chunks.items():
        for nm in c['decl']:
            if nm in eager_decl:
                fail('%s 가 src/js 와 lazy/%s 양쪽에 선언되어 있다' % (nm, n))
            if nm in owner:
                fail('%s 가 lazy/%s 와 lazy/%s 양쪽에 선언되어 있다' % (nm, owner[nm], n))
            owner[nm] = n
    for n, c in chunks.items():
        outside = set(eager_refs)
        for m, o in chunks.items():
            if m != n:
                outside |= o['refs']
        for nm in c['decl']:
            if nm not in outside:
                continue
            if nm not in c['fn']:
                fail('lazy/%s 의 %s 를 조각 밖에서 쓴다. 함수가 아니면 src/js 로 옮겨야 한다' % (n, nm))
            stubs.append("function %s(){return lzCall('%s','%s',arguments);}" % (nm, n, nm))

    # 조각 파일: 코드 끝에 '내보내기'(맨 바깥 함수 전부)를 붙여 eval 결과로 돌려받는다
    out, meta, inline = {}, {}, {}
    for n, c in chunks.items():
        js = c['js'] + '\n;({' + ','.join('%s:%s' % (f, f) for f in c['fn']) + '})\n//# sourceURL=lazy/' + n + '.js\n'
        body = 'window.__ppLZ(%s,%s,%s);\n' % (json.dumps(n), json.dumps(js, ensure_ascii=False), json.dumps(c['css'], ensure_ascii=False))
        inline[n] = {'js': js, 'css': c['css']}
        out['lazy/' + n + '.js'] = body
        meta[n] = {'v': sha(body, 10), 'h': sha(js, 16)}

    gen = ('// ---- build.py가 만든 부분: 나중에 받는 조각 목록과 대신 부르기 함수 ----\n'
           'const LZ_M=' + json.dumps(meta, separators=(',', ':')) + ';\n' + '\n'.join(stubs) + '\n')
    js = '(function(){\n' + gen + eager + '})();\n'
    for k in ('<!--@CSS-->', '<!--@JS-->'):
        if shell.count(k) != 1:
            fail('src/shell.html 에 ' + k + ' 가 한 번만 있어야 한다')
    html = (shell.replace('<!--@CSS-->', '<link rel="stylesheet" href="game.css?v=' + sha(css, 10) + '">')
                 .replace('<!--@JS-->', '<script src="game.js?v=' + sha(js, 10) + '"></script>'))
    out.update({'index.html': html, 'game.css': css, 'game.js': js})
    # 한 파일 판: 디자인·코드를 그대로 넣고, 나중에 받는 조각은 JSON으로 넣어 둔다('</'는 '<\/'로 바꿔 스크립트가 끊기지 않게)
    data = json.dumps(inline, ensure_ascii=False).replace('</', '<\\/')
    single = (shell.replace('<!--@CSS-->', '<style>\n' + css + '</style>')
                   .replace('<!--@JS-->', '<script id="lzd" type="application/json">' + data + '</script>\n<script>\n' + js + '</script>'))
    return out, single


def main():
    out, single = build()
    if '--single' in sys.argv:
        k = sys.argv.index('--single')
        if k + 1 >= len(sys.argv):
            fail('--single 다음에 만들 파일 경로를 적는다')
        open(sys.argv[k + 1], 'w', encoding='utf-8', newline='').write(single)
        print('한 파일 판 %dKB → %s' % (len(single.encode('utf-8')) // 1024, sys.argv[k + 1]))
        return
    stale = [os.path.join('lazy', f) for f in (os.listdir(os.path.join(ROOT, 'lazy')) if os.path.isdir(os.path.join(ROOT, 'lazy')) else [])
             if os.path.join('lazy', f).replace('\\', '/') not in out]
    if '--check' in sys.argv:
        bad = [f for f, s in out.items() if not os.path.exists(os.path.join(ROOT, f)) or read(os.path.join(ROOT, f)) != s] + stale
        if bad:
            sys.exit('src/ 와 다르다: ' + ', '.join(bad) + ' → python build.py')
        print('맞음')
        return
    os.makedirs(os.path.join(ROOT, 'lazy'), exist_ok=True)
    for f in stale:
        os.remove(os.path.join(ROOT, f))
    for f, s in out.items():
        open(os.path.join(ROOT, f), 'w', encoding='utf-8', newline='').write(s)
    print(' · '.join('%s %dKB' % (f, len(s.encode('utf-8')) // 1024) for f, s in out.items()))


if __name__ == '__main__':
    main()
