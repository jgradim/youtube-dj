require 'rubygems'
require 'sinatra'

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
  set :public, "#{File.dirname(__FILE__)}/public"
end

# root page
get '/' do
  erb :index
end
