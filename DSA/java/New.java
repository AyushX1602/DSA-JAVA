import java.util.Scanner;

public class New{
    public static void main(String[] args) {
        // System.out.print("hey there");

        Scanner sc = new Scanner(System.in);

        // System.out.print("Enter the value of radius:");

        // double radius = sc.nextDouble();

        // double area = Math.PI * radius * radius;
        // System.out.println("The area of circle is "+area);

        System.out.println("Enter the principle amount:");
        double principle =sc.nextDouble();
        System.out.println("Enter the rate of interest:");
        double rate = sc.nextDouble();
        System.out.println("Enter the time period:");
        double time = sc.nextDouble();

        double simpleInterest = (principle * rate * time)/100;
        System.out.println("The simple interest is "+simpleInterest);
    }
}