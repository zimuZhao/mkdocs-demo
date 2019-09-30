$('.md-logo').attr('href', 'http://jinghailu.jd.com/')

/**
 * 获取搜索参数填充至搜索区，自动触发搜索
 */
let searchKey = getUrlParam('searchKey')
if (searchKey) {
  $('.md-search__input').attr('value', searchKey)
  $('.md-search__input').focus()
  $('.md-search__input').blur()
}

function getUrlParam (name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  let r = window.location.search.substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}

/**
 * 图片放大插件初始化
 */
$(document).ready(function () {
  let productImageGroups = []
  $('.img-fluid').each(function () {
    let productImageSource = $(this).attr('src')
    let productImageTag = $(this).attr('tag')
    let productImageTitle = $(this).attr('title')
    if (productImageTitle) {
      productImageTitle = 'title="' + productImageTitle + '" '
    }
    else {
      productImageTitle = ''
    }
    $(this).
        wrap('<a class="boxedThumb ' + productImageTag + '" ' +
            productImageTitle + 'href="' + productImageSource + '"></a>')
    productImageGroups.push('.' + productImageTag)
  })
  jQuery.unique(productImageGroups)
  productImageGroups.forEach(productImageGroupsSet)

  function productImageGroupsSet (value) {
    $(value).simpleLightbox()
  }
})


