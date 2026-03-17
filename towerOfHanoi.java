public class towerOfHanoi {

    public static void main(String[] args) {
        hanoi(3, 'A', 'B', 'C');
    }
    public static void hanoi(int n, char a,char b, char c){
        if(n==0){
            return;
        }
       //n-1 disks form A to B using C as helper
        hanoi(n-1, a, c, b);

        //largest disk from A to C
        System.out.println(a+"-->"+ c);
        //n-1 disks from B to C using A as helper
        hanoi (n-1, b, a, c);
    }
}