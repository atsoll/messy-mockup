

//for scale
var vh = window.innerHeight/100;
var vw = window.innerWidth/100;

//for gh pages workaround
prefix = "/messy-mockup"




var app = angular.module('template',['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ngtweet', 'duScroll']);

app.config(function($routeProvider) {

    //configure the routes

    $routeProvider
    .when("/", {
        templateUrl : prefix + "/views/home.html",
    })
    .when ("/conference", {
        templateUrl : prefix + "/views/conference.html",
    })
    .when ("/news", {
        templateUrl : prefix + "/views/news.html",
    })
    .when ("/resources", {
        templateUrl : prefix + "/views/resources.html",
    })
    .when ("/organization", {
        templateUrl : prefix + "/views/organization.html",
    })

});

//to enable lodash
app.constant('_', window._)
  .run(function ($rootScope) {
     $rootScope._ = window._;
});

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

let taglist = []
let year_list = []
var b_tags = ["#CEd", "#DEI", "#CS1", "#CS4All", "#higherEd"]


app.controller('ctrl', function($scope, $window, $document, $uibModal, $location, $anchorScroll, $sce, $timeout, $http) {

  this.$onInit = function () {
    AOS.init()
  }

  $scope.model = {
    active:'',
    menu_open: false,
    carousel: {
      interval: 3000,
      active:0
    },

    static:{
      footer:{
        links:[{icon:"fa fa-envelope", link:"mailto:iceremail@example.com"}, {icon:"fab fa-twitter", link:"https://twitter.com/ICER_C"}]
      },
      banner:[{img:"style/images/banner_3.jpg", title:"Structure and Governance", blurb:"How things work.", link:"#!/organization"}, {img:"style/images/banner_2.jpg", title:"ICER 2023", blurb:"August 8-10, Chicago IL USA", link:"#!/conference"}, {img:"style/images/banner_1.jpg", title:"Websites You Should Know About ", blurb:"And other cool things",  link:"#!/resoucres"}],
      menu:[ {name:"conference", children:[{name:"About", link:""}, {name:"Chicago 2023", link:""}, {name:"Archive", link:""}], link:"#!/conference"}, {name:"organization", children:[{name:"Structure", link:""}, {name:"Policies", link:""}], link:"#!/organization"}, {name:"news & events", children:[], link:"#!/news"}, {name:"resources", children:[{name:"FAQ", link:""}, {name:"Useful links", link:""}], link:"#!/resources"}, ],
      news: {
        posts: ['Exciting News!', 'A Serious Announcement.', 'We Did Some Things!', "Some Other Things We Did.", 'Some Thoughts', "Some More Thoughts", "Thoughts....", ".... and More Thoughts", "Another Post"].map(function(x){
          l = [Math.floor(Math.random()*Math.floor(5)), Math.floor(Math.random()*Math.floor(5))]
          t = Array.from(new Set(l.map(function(x){
            return b_tags[x]
          })))
          d = randomDate(new Date(), new Date(2025, 0, 1))
          taglist = taglist.concat(t)
          year_list.push(d.getFullYear())
          return {
            date: d,
            title: x,
            tags: t,
            collapsed: true
          }
        }).sort((a, b) => (a.date < b.date) ? 1 : -1),
        tag_filter: [],
        year_filter:[],
        tags:[]
      }
    }
  }



  $document.ready(function(){
    promises = []
    $scope.model.width = window.innerWidth
    //scroll watch
    angular.element($("body")).bind('scroll', _.throttle(function(){
       AOS.refresh();
       $scope.$apply()

      if($scope.model.active!=''){
        return
      }

      /*if(document.body.scrollTop > 10) {
         angular.element( document.querySelector( '#header' )).addClass('shrink')
      }
      else {
         angular.element( document.querySelector( '#header' )).removeClass('shrink')
      }*/

      let banner =   $("#banner")
      let img = $("#banner img")
      banner.css("opacity", 1 - document.body.scrollTop/banner.innerHeight());


    }, 10));


  });

  $scope.model.static.news.tags = Array.from(new Set(taglist)).map(function(x){
    return {
      tag: x,
      num: taglist.filter(function(y){return y==x}).length
    }
  })

  $scope.model.static.news.years = Array.from(new Set(year_list)).map(function(x){
    return {
      year: x,
      num: year_list.filter(function(y){return y==x}).length
    }
  }).sort((a, b) => (a.year < b.year) ? 1 : -1),

  $scope.$on('$locationChangeSuccess', function(event, toState){
     let target = toState.split('!/')[1]
     if(target) {
         $scope.model.active = target
         console.log(target)
     }
     else {
        $scope.model.active = ''
     }
     /*if($scope.model.active != '') {

       $('#header' ).addClass('shrink')

    }*/




    //gross scrolltop workaround b/c of the sticky header
    let s= angular.element($("#scroll-container"))
    let elem = angular.element($('#scroll-anchor'))
    s.scrollToElementAnimated(elem,150,700)
    if($scope.model.active == '') {
      angular.element( document.querySelector( '#header' )).removeClass('shrink')
    }
   })




  //right now this is one big OR filter
  //it could be changed to an AND filter pretty easily
  $scope.showNews = function(item) {
    if($scope.model.static.news.tag_filter.length==0 && $scope.model.static.news.year_filter.length==0) {
      return true;
    }
    if($scope.model.static.news.tag_filter.length!=0) {
      for(let i=0;i< item.tags.length; i++) {
        if($scope.model.static.news.tag_filter.includes(item.tags[i])){
          return true;
        }
      }
    }

    if($scope.model.static.news.year_filter.length!=0) {
      if($scope.model.static.news.year_filter.includes(item.date.getFullYear())) {
        return true
      }
    }

    return false

  }

  $scope.updateFilter = function(tag) {

    if(tag.year){
      if($scope.model.static.news.year_filter.includes(tag.year)){
        $scope.model.static.news.year_filter.splice($scope.model.static.news.year_filter.indexOf(tag.year), 1);
      }
      else {
        $scope.model.static.news.year_filter.push(tag.year)
      }
    }
    else {
      if($scope.model.static.news.tag_filter.includes(tag.tag)){
        $scope.model.static.news.tag_filter.splice($scope.model.static.news.tag_filter.indexOf(tag.tag), 1);
      }
      else {
        $scope.model.static.news.tag_filter.push(tag.tag)
      }
    }

  }




})
