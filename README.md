# 帮助中心

## 环境

python: 3.7.2

```bash
# 安装依赖
pip install mkdocs mkdocs-material
pip install jieba
# 本地调试
mkdocs serve
# 打包
mkdocs build
```


| 包名 | 模块名 | 版本 |
| :-- | :--: | --: |
| mkdocs | mkdocs | 1.0.4 |
| mkdocs-material | material | 3.0.6 |
| Markdown | markdown | 3.0.1 |
| pymdown-extensions | pymdownx | 6.0 |
| jieba | jieba | 0.39 |

## 支持中文搜索所需改动

- 进入python的安装目录修改search_index.py文件

  我的目录在/Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages/mkdocs/contrib/search/，修改generate_search_index
```python
    def generate_search_index(self):
        """python to json conversion"""
        page_dicts = {
            'docs': self._entries,
            'config': self.config
        }
        for doc in page_dicts['docs']: # 调用jieba的cut接口生成分词库，过滤重复词，过滤空格
            tokens = list(set([token.lower() for token in jieba.cut_for_search(doc['title'].replace('\n', ''), True)]))
            if '' in tokens:
                tokens.remove('')
            doc['title_tokens'] = tokens

            tokens = list(set([token.lower() for token in jieba.cut_for_search(doc['text'].replace('\n', ''), True)]))
            if '' in tokens:
                tokens.remove('')
            doc['text_tokens'] = tokens

        data = json.dumps(page_dicts, sort_keys=True, separators=(',', ':'), ensure_ascii=False)

        if self.config['prebuild_index']:
            try:
                script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'prebuild-index.js')
                p = subprocess.Popen(
                    ['node', script_path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                idx, err = p.communicate(data.encode('utf-8'))
                if not err:
                    idx = idx.decode('utf-8') if hasattr(idx, 'decode') else idx
                    page_dicts['index'] = json.loads(idx)
                    data = json.dumps(page_dicts, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
                    log.debug('Pre-built search index created successfully.')
                else:
                    log.warning('Failed to pre-build search index. Error: {}'.format(err))
            except (OSError, IOError, ValueError) as e:
                log.warning('Failed to pre-build search index. Error: {}'.format(e))

        return data
```

- 修改lunr.js

  我的目录：/Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages/mkdocs/contrib/search/templates/search/，搜索lunr.Builder.prototype.add替换部分代码
```javascript
// 仅替换前15行
lunr.Builder.prototype.add = function (doc, attributes) {
  var docRef = doc[this._ref],
      fields = Object.keys(this._fields)

  this._documents[docRef] = attributes || {}
  this.documentCount += 1

  for (var i = 0; i < fields.length; i++) {
    var fieldName = fields[i],
        extractor = this._fields[fieldName].extractor,
        field = extractor ? extractor(doc) : doc[fieldName],
        tokens = doc[fieldName + '_tokens'],
        terms = this.pipeline.run(tokens),
        fieldRef = new lunr.FieldRef (docRef, fieldName),
        fieldTerms = Object.create(null)
```
还有一部分需替换
```javascript
lunr.trimmer = function (token) {
  return token.update(function (s) {
    return s.replace(/^\s+/, '').replace(/\s+$/, '')
  })
}
```
