use Test::More;
use Convos::Util qw(disk_usage generate_secret require_module short_checksum);
use Mojo::Loader 'data_section';
use Mojo::Util qw(b64_encode gzip sha1_sum);

SKIP: {
  skip $@, 1 unless my $stats = eval { disk_usage '/' };
  is_deeply [sort keys %$stats],
    [qw(block_size blocks_free blocks_total blocks_used dev inodes_free inodes_total inodes_used)],
    'disk_usage';
  ok $stats->{block_size} > 1, 'block_size';
  ok $stats->{blocks_total} >= $stats->{blocks_used}, 'blocks_total/used';
  ok $stats->{blocks_total} >= $stats->{blocks_free}, 'blocks_total/free';
  ok $stats->{inodes_total} >= $stats->{inodes_used}, 'inodes_total/used';
  ok $stats->{inodes_total} >= $stats->{inodes_free}, 'inodes_total/free';
}

is short_checksum(sha1_sum(3)), 'd952uzY7q7tY7bH4', 'short_checksum sha1_sum';
is short_checksum('jhthorsen@cpan.org'), 'gNQ981Q2TztxSsRL', 'short_checksum email';
is short_checksum(sha1_sum('jhthorsen@cpan.org')), 'gNQ981Q2TztxSsRL',
  'short_checksum sha1_sum email';

eval { require_module 'Foo::Bar' };
my $err = $@;
like $err, qr{You need to install Foo::Bar to use main:}, 'require_module failed message';
like $err, qr{\./script/convos cpanm -n Foo::Bar},        'require_module failed cpanm';

eval { require_module 'Convos::Util' };
ok !$@, 'require_module success';

note 'generate_secret';
is length(generate_secret), 40, 'generate_secret';
my %secrets;
map { $secrets{+Convos::Util::_generate_secret_urandom()}++ } 1 .. 1000 if -r '/dev/urandom';
map { $secrets{+Convos::Util::_generate_secret_fallback()}++ } 1 .. 1000;
is_deeply [values %secrets], [map {1} values %secrets],
  '1..1000 is not nearly enough to prove anything, but testing it anyways';

done_testing;
