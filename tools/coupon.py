"""팬데믹 대통령 쿠폰 표 고치기: src/lazy/boxes/1-coupons.js 의 CPN 을 더하고 빼고 본다.

  python tools/coupon.py add 코드 보상 [--until YYYY-MM-DD] [--label 이름]
  python tools/coupon.py list
  python tools/coupon.py remove 코드          (또는 remove --hash 지문앞자리)
  python tools/coupon.py check 코드           이 코드가 표에 있는지
  python tools/coupon.py rewards              보상 종류와 대상 전부

- 표에는 코드 대신 지문(PBKDF2-SHA256)만 적는다. 그래서 공개된 소스를 열어 봐도 코드는 보이지 않는다.
  짧은 코드는 하나씩 넣어 보면 찾을 수 있으니 8자 이상으로 만든다. 코드는 대문자로 바꾸고 띄어쓰기 · - _ . · 을 빼고 비교한다
  (그래서 'winter-2026' 과 'WINTER 2026' 은 같은 쿠폰). 한글도 된다.
- 지문 만드는 법은 게임(src/lazy/boxes/2-boxes.js 의 cpnNorm · cpnHash)과 같아야 한다. 한쪽을 고치면 다른 쪽도 고친다.
- 고친 뒤에는 python build.py 로 만들고 커밋한다.
"""
import argparse, datetime, hashlib, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLE = os.path.join(ROOT, 'src', 'lazy', 'boxes', '1-coupons.js')
BEGIN, END = '// @coupons-begin', '// @coupons-end'
SALT, ITER = 'pandemic-president-coupon-v1', 60000

# 보상 종류 → {대상: 설명}. 게임의 CPN_R(src/lazy/boxes/2-boxes.js)과 이름을 맞춘다. all 은 그 종류 전부
REWARDS = {
    'mini': ('미니게임 열기', {'zombie': '방역선', 'sail': '대항해', 'star': '별똥별을 피해라'}),
    'stage': ('비밀 무대 열기', {'reich': '전쟁기 독일', 'bonn': '라인강의 기적'}),
    'fig': ('잠긴 비밀 인물(출발 인물) 깨우기', {'dangun': '단군왕검', 'tutor': '주시경', 'jyw': '정영우(한 번뿐인 인물: 이미 함께했어도 한 번 더)',
                                          'hong': '홍길동(조선)', 'unclesam': '엉클 샘(미국)'}),
    'dex': ('지도자 도감에 올리기', None),   # 대상은 src/js/01-career-data.js 의 LEADK 에서 읽는다
    'tok': ('다음 새 게임에서 운명 개입(다시 굴리기) N번 더(1~5, 받아 둔 것은 모두 합쳐 9까지)', None),
}


def leaders():
    """도감의 지도자 목록(게임의 LEADK)을 src/js 에서 읽는다: const LEADK=[…] 뒤의 LEADK.splice(0,LEADK.length,…) · LEADK.push(…) 를 차례로 따른다"""
    try:
        d = os.path.join(ROOT, 'src', 'js')
        s = ''.join(open(os.path.join(d, f), encoding='utf-8').read() for f in sorted(os.listdir(d)) if f.endswith('.js'))
        ids = []
        for m in re.finditer(r'const LEADK=\[([^\]]*)\]|LEADK\.splice\(0,LEADK\.length,([^)]*)\)|LEADK\.push\(([^)]*)\)', s):
            got = re.findall(r"'([A-Za-z0-9_]+)'", m.group(1) or m.group(2) or m.group(3))
            ids = ids + got if m.group(3) is not None else got
        out = {}
        for i in ids:
            m = re.search(r"\b%s:\{n:'([^']+)'" % re.escape(i), s)
            out[i] = m.group(1) if m else i
        return out
    except Exception:
        return {}


def targets(kind):
    return leaders() if kind == 'dex' else REWARDS[kind][1]


def norm(code):
    return re.sub(r'[\s\-_.·]', '', unicodedata.normalize('NFKC', code).upper())


def digest(code):
    return hashlib.pbkdf2_hmac('sha256', norm(code).encode('utf-8'), SALT.encode('utf-8'), ITER, dklen=16).hex()


def check_reward(r):
    """'mini:sail+tok:2' 처럼 + 로 이은 보상을 확인한다. 틀리면 이유를 돌려준다"""
    if not r:
        return '보상이 비어 있다'
    for p in r.split('+'):
        if ':' not in p:
            return "'%s' 는 종류:대상 모양이 아니다(예: mini:sail)" % p
        k, a = p.split(':', 1)
        if k not in REWARDS:
            return "'%s' 는 모르는 보상 종류다(가능: %s)" % (k, ', '.join(REWARDS))
        if k == 'tok':
            if not a.isdigit() or not 1 <= int(a) <= 5:
                return 'tok 은 1~5 사이 숫자다(예: tok:2)'
        elif a != 'all' and a not in targets(k):
            return "'%s' 는 %s 의 대상이 아니다(가능: %s, all)" % (a, k, ', '.join(targets(k)))
    return None


def describe(r):
    out = []
    for p in r.split('+'):
        k, a = p.split(':', 1)
        if k == 'tok':
            out.append('운명 개입 +%s' % a)
        else:
            out.append('%s: %s' % (REWARDS[k][0], '전부' if a == 'all' else targets(k).get(a, a)))
    return ' / '.join(out)


def load():
    s = open(TABLE, encoding='utf-8').read()
    i, j = s.find(BEGIN), s.find(END)
    if i < 0 or j < i:
        sys.exit('쿠폰 표에서 %s / %s 줄을 찾지 못했다: %s' % (BEGIN, END, TABLE))
    i = s.index('\n', i) + 1
    rows = []
    for ln in s[i:j].splitlines():
        ln = ln.strip().rstrip(',')
        if ln and not ln.startswith('//'):
            rows.append(json.loads(ln))
    return s[:i], rows, s[j:]


def save(head, rows, tail):
    body = ''.join(json.dumps({k: c[k] for k in ('h', 'r', 'u', 'l') if c.get(k)}, ensure_ascii=False, separators=(',', ':')) + ',\n' for c in rows)
    open(TABLE, 'w', encoding='utf-8', newline='').write(head + body + tail)


def today():
    return (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=9)).date().isoformat()


def cmd_add(a):
    n = norm(a.code)
    if not 4 <= len(n) <= 40:
        sys.exit('코드는 다듬은 뒤 4~40자여야 한다(지금 %d자: %s)' % (len(n), n))
    bad = check_reward(a.reward)
    if bad:
        sys.exit('보상 오류: ' + bad)
    if a.until:
        try:
            datetime.date.fromisoformat(a.until)
        except ValueError:
            sys.exit('--until 은 YYYY-MM-DD 모양이어야 한다(예: 2026-12-31)')
        if a.until < today():
            print('주의: 마지막 날(%s)이 오늘(%s)보다 앞이라 바로 기간이 끝난 쿠폰이 된다.' % (a.until, today()))
    if a.label and len(a.label) > 40:
        sys.exit('--label 은 40자까지')
    head, rows, tail = load()
    h = digest(a.code)
    if any(c['h'] == h for c in rows):
        sys.exit('이미 있는 코드다(%s). 바꾸려면 remove 한 뒤 다시 add.' % n)
    rows.append({'h': h, 'r': a.reward, 'u': a.until or '', 'l': a.label or ''})
    save(head, rows, tail)
    if len(n) < 8:
        print('주의: 코드가 %d자로 짧다. 8자 이상이면 하나씩 넣어 맞히기 어렵다.' % len(n))
    print('더했다: %s → %s%s%s' % (n, describe(a.reward), ' · %s까지' % a.until if a.until else ' · 기한 없음', ' · "%s"' % a.label if a.label else ''))
    print('다음: python build.py && python build.py --check 한 뒤 커밋')


def cmd_list(a):
    _, rows, _ = load()
    if not rows:
        print('쿠폰 표가 비어 있다.')
        return
    t = today()
    for c in rows:
        u = c.get('u') or ''
        st = '기한 없음' if not u else ('%s까지(끝남)' % u if u < t else '%s까지' % u)
        print('%s…  %-26s %-18s %s' % (c['h'][:10], c['r'], st, c.get('l') or '(이름 없음)'))
        print('            %s' % describe(c['r']))
    print('모두 %d장 · 코드는 표에 없으니 따로 적어 두세요(지문 앞자리로 remove --hash 가능)' % len(rows))


def cmd_remove(a):
    if not a.code and not a.hash:
        sys.exit('지울 코드나 --hash 지문앞자리를 적는다')
    head, rows, tail = load()
    if a.code:
        h = digest(a.code)
        keep = [c for c in rows if c['h'] != h]
    else:
        hit = [c for c in rows if c['h'].startswith(a.hash.lower())]
        if len(hit) > 1:
            sys.exit('지문 앞자리 %s 에 맞는 쿠폰이 %d장이다. 더 길게 적는다.' % (a.hash, len(hit)))
        keep = [c for c in rows if c not in hit]
    if len(keep) == len(rows):
        sys.exit('표에 그런 쿠폰이 없다.')
    save(head, keep, tail)
    print('지웠다(%d장 남음). 다음: python build.py 한 뒤 커밋' % len(keep))


def cmd_check(a):
    _, rows, _ = load()
    h = digest(a.code)
    c = next((c for c in rows if c['h'] == h), None)
    print('%s → %s' % (norm(a.code), ('있다: ' + describe(c['r']) + (' · %s까지' % c['u'] if c.get('u') else '') + (' · "%s"' % c['l'] if c.get('l') else '')) if c else '표에 없다'))


def cmd_rewards(a):
    print(REWARDS_HELP)


def rewards_help():
    out = ['보상 = 종류:대상. 여러 개는 + 로 잇는다(예: mini:sail+tok:2). 대상에 all 을 쓰면 그 종류 전부.']
    for k, (d, _) in REWARDS.items():
        t = targets(k)
        out.append('  %-6s %s' % (k, d))
        if t:
            out.append('         ' + ', '.join('%s(%s)' % (i, n) for i, n in t.items()) + ', all')
        elif k == 'tok':
            out.append('         tok:1 ~ tok:5')
    out.append('이미 가진 보상은 "이미 있었어요"로 보이고, 쿠폰은 그래도 쓴 것으로 남는다. 받은 기록은 기기마다(브라우저 저장소)이고,')
    out.append("'이 기기 기록 초기화'를 하면 보상과 함께 지워져 같은 쿠폰을 다시 쓸 수 있다.")
    return '\n'.join(out)


REWARDS_HELP = rewards_help()


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    ap = argparse.ArgumentParser(prog='python tools/coupon.py', description='팬데믹 대통령 쿠폰 표(src/lazy/boxes/1-coupons.js) 고치기',
                                 epilog=REWARDS_HELP + '\n\n예:\n  python tools/coupon.py add WINTER2026 mini:sail+tok:2 --until 2026-12-31 --label "겨울방학 선물"\n'
                                        '  python tools/coupon.py add HAFS-OPEN fig:jyw --label "개교기념일"\n  python tools/coupon.py remove WINTER2026',
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='cmd', required=True)
    p = sp.add_parser('add', help='쿠폰 더하기', epilog=REWARDS_HELP, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('code', help='쿠폰 코드(대소문자 · 띄어쓰기 · - _ . · 는 상관없다)')
    p.add_argument('reward', help='보상(아래 참고). 예: mini:sail, tok:2, mini:all+fig:dangun')
    p.add_argument('--until', help='마지막 날 YYYY-MM-DD(한국 시간, 그날까지 쓸 수 있다). 없으면 기한 없음')
    p.add_argument('--label', help='받을 때 보이는 이름(40자까지). 예: "겨울방학 선물"')
    p.set_defaults(fn=cmd_add)
    sp.add_parser('list', help='표 보기(코드는 없고 지문 앞자리만)').set_defaults(fn=cmd_list)
    p = sp.add_parser('remove', help='쿠폰 지우기')
    p.add_argument('code', nargs='?', help='지울 쿠폰 코드')
    p.add_argument('--hash', help='코드를 모를 때: list 에 보이는 지문 앞자리')
    p.set_defaults(fn=cmd_remove)
    p = sp.add_parser('check', help='이 코드가 표에 있는지')
    p.add_argument('code')
    p.set_defaults(fn=cmd_check)
    sp.add_parser('rewards', help='보상 종류와 대상 보기').set_defaults(fn=cmd_rewards)
    a = ap.parse_args()
    a.fn(a)


if __name__ == '__main__':
    main()
