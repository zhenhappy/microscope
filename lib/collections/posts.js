Posts = new Mongo.Collection('posts');

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

Meteor.methods({
  postInsert: function(postAttributes) {
    var user = Meteor.user();
    check(user._id, String);
    check(user.username, String);
    check(postAttributes, {
      title: String,
      url: String
    });

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true
      }
    }

    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
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
  }
});
