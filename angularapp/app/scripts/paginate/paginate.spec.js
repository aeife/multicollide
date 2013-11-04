describe( 'paginate service', function() {

  var Paginate;

  beforeEach(module('paginate'));

  beforeEach( inject( function( _Paginate_) {
    Paginate = _Paginate_;
  }));

  it('should initialized correctly', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.data.length).toBe(10);
    expect(pagination.page).toBe(0);
  }));

  it('should generate empty array for page view with length equal to pages', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.pageArray.length).toBe(2);
  }));

  it('should start with first element', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.data[pagination.startFrom]).toBe(1);
  }));

  it('should go to next page', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.page).toBe(0);
    expect(pagination.data[pagination.startFrom]).toBe(1);

    pagination.nextPage();

    expect(pagination.page).toBe(1);
    expect(pagination.data[pagination.startFrom]).toBe(6);
  }));

  it('should not go further than last page', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    pagination.nextPage();

    expect(pagination.page).toBe(1);
    expect(pagination.data[pagination.startFrom]).toBe(6);

    pagination.nextPage();

    expect(pagination.page).toBe(1);
    expect(pagination.data[pagination.startFrom]).toBe(6);
  }));

  it('should go to previous page', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    pagination.nextPage();

    expect(pagination.page).toBe(1);
    expect(pagination.data[pagination.startFrom]).toBe(6);

    pagination.previousPage();

    expect(pagination.page).toBe(0);
    expect(pagination.data[pagination.startFrom]).toBe(1);
  }));

  it('should not go further previous than first page', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.page).toBe(0);
    expect(pagination.data[pagination.startFrom]).toBe(1);

    pagination.previousPage();

    expect(pagination.page).toBe(0);
    expect(pagination.data[pagination.startFrom]).toBe(1);

  }));

  it('should update start and limit correctly', inject(function(){
    var pagination = new Paginate([1,2,3,4,5,6,7,8,9,10], 5);

    expect(pagination.startFrom).toBe(0);

    pagination.page = 1;
    pagination.update();

    expect(pagination.startFrom).toBe(5);
  }));
});
