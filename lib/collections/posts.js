Posts = new Mongo.Collection('posts');

validatePost = function (post) {
  var errors = {};
  if (!post.title)
    errors.title = "请填写标题";
  if (!post.url)
    errors.url =  "请填写 URL";
  return errors;
}

Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // 只能更改如下两个字段：
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

Meteor.methods({
  postInsert: function(postAttributes) {
    var user = Meteor.user();
    check(user._id, String);
    check(user.username, String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "你必须为你的帖子填写标题和 URL");

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true
      }
    }

    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });

    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },
  postUpdate: function(currentPostId, postAttributes) {
    var user = Meteor.user();
    check(user._id, String);
    check(user.username, String);
    check(currentPostId, String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var post = Posts.findOne({_id: currentPostId});
    if (!ownsDocument(user._id, post)){
      return {
        userInvalid: true
      }
    }

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true
      }
    }

    post = _.extend(post, postAttributes);

    Posts.update(currentPostId, post);

    return {
      _id: currentPostId
    };
  },
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });
    if (! affected)
      throw new Meteor.Error('invalid', "You weren't able to upvote that post");
  }
});
