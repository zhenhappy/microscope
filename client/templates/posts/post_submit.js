Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault(); // 确保浏览器不会再继续尝试提交表单

    var post = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    };

    post._id = Posts.insert(post);
    Router.go('postPage', post);
  }
});
