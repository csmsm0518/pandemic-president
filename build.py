"""팬데믹 대통령 빌드: src/ 의 조각을 모아 index.html · game.css · game.js 를 만든다.

  python build.py          만들기
  python build.py --check  만든 파일이 src/ 와 맞는지만 확인(커밋 전에)

- 코드는 src/js/ 에 기능별로 나뉘어 있고, 파일 이름 앞 번호 순서대로 이어 붙여
  (function(){ … })(); 하나로 감싼다. 그래서 조각끼리는 예전 한 파일일 때처럼 서로의 변수를 그대로 쓴다.
- 디자인은 src/css/ 를 번호 순서대로 이어 붙인다.
- index.html 은 내용이 바뀔 때마다 game.css?v=… · game.js?v=… 로 새 주소를 달아
  브라우저가 예전 파일을 붙잡고 있지 않게 한다. 바뀌지 않은 파일은 다시 받지 않는다.
- 만든 세 파일은 직접 고치지 않는다. 고칠 곳은 src/ 다.
"""
import hashlib, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')


def read(p):
    return open(p, encoding='utf-8').read()


def parts(d, ext):
    fs = sorted(f for f in os.listdir(d) if f.endswith(ext))
    return ''.join(read(os.path.join(d, f)) for f in fs)


def build():
    css = parts(os.path.join(SRC, 'css'), '.css')
    js = '(function(){\n' + parts(os.path.join(SRC, 'js'), '.js') + '})();\n'
    h = lambda s: hashlib.sha1(s.encode('utf-8')).hexdigest()[:10]
    shell = read(os.path.join(SRC, 'shell.html'))
    for k in ('<!--@CSS-->', '<!--@JS-->'):
        if shell.count(k) != 1:
            sys.exit('src/shell.html 에 ' + k + ' 가 한 번만 있어야 한다')
    html = (shell.replace('<!--@CSS-->', '<link rel="stylesheet" href="game.css?v=' + h(css) + '">')
                 .replace('<!--@JS-->', '<script src="game.js?v=' + h(js) + '"></script>'))
    return {'index.html': html, 'game.css': css, 'game.js': js}


def main():
    out = build()
    if '--check' in sys.argv:
        bad = [f for f, s in out.items() if not os.path.exists(os.path.join(ROOT, f)) or read(os.path.join(ROOT, f)) != s]
        if bad:
            sys.exit('src/ 와 다르다: ' + ', '.join(bad) + ' → python build.py')
        print('맞음')
        return
    for f, s in out.items():
        open(os.path.join(ROOT, f), 'w', encoding='utf-8', newline='').write(s)
    print(' · '.join('%s %dKB' % (f, len(s.encode('utf-8')) // 1024) for f, s in out.items()))


if __name__ == '__main__':
    main()
